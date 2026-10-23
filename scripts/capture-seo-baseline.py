#!/usr/bin/env python3
"""Read-only public ZiaFlow route inventory. No credentials or form submissions."""
import argparse
import concurrent.futures
import datetime
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ORIGIN = 'https://ziaflow.com'
HOSTS = {'ziaflow.com', 'www.ziaflow.com'}


def safe_url(value, base=ORIGIN):
    url = urllib.parse.urlsplit(urllib.parse.urljoin(base, value))
    if url.scheme not in ('http', 'https') or url.hostname not in HOSTS:
        raise ValueError('URL outside ZiaFlow scope')
    if url.username or url.password or url.port not in (None, 80, 443):
        raise ValueError('Unexpected URL authority')
    if url.path.startswith(('/api/', '/_api/')):
        raise ValueError('API routes excluded from public crawl')
    return urllib.parse.urlunsplit((url.scheme, url.netloc, url.path or '/', '', ''))


class ScopedRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return super().redirect_request(req, fp, code, msg, headers, safe_url(newurl, req.full_url))


def fetch(url):
    opener = urllib.request.build_opener(ScopedRedirect())
    request = urllib.request.Request(safe_url(url), headers={'User-Agent': 'ZiaFlow-Migration-Baseline/1.0'})
    try:
        response = opener.open(request, timeout=15)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        body = response.read(4_000_001)
        if len(body) > 4_000_000:
            raise ValueError('Response exceeds 4MB capture limit')
        charset = response.headers.get_content_charset() or 'utf-8'
        return response.status, response.geturl(), dict(response.headers), body.decode(charset, errors='replace')


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.titles, self.h1s, self.meta, self.canonicals = [], [], [], []
        self.links, self.images, self.ids, self.schema_types = [], [], set(), []
        self._title = self._h1 = None
        self._skip = 0
        self._jsonld = None
        self.main_text = []
        self._main = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if tag == 'title':
            self._title = []
        if tag == 'h1':
            self._h1 = []
        if tag == 'meta':
            self.meta.append(attrs)
        if tag == 'link' and 'canonical' in attrs.get('rel', '').split():
            self.canonicals.append(attrs.get('href', ''))
        if tag == 'a' and attrs.get('href'):
            self.links.append(attrs['href'])
        if tag == 'img':
            self.images.append({'src': attrs.get('src', ''), 'alt': attrs.get('alt'), 'loading': attrs.get('loading')})
        if tag == 'main':
            self._main += 1
        if tag in ('script', 'style'):
            self._skip += 1
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self._jsonld = []

    def handle_data(self, data):
        if self._jsonld is not None:
            self._jsonld.append(data)
        if self._skip:
            return
        if self._title is not None:
            self._title.append(data)
        if self._h1 is not None:
            self._h1.append(data)
        if self._main:
            self.main_text.append(data)

    def handle_endtag(self, tag):
        if tag == 'title' and self._title is not None:
            self.titles.append(' '.join(''.join(self._title).split()))
            self._title = None
        if tag == 'h1' and self._h1 is not None:
            self.h1s.append(' '.join(''.join(self._h1).split()))
            self._h1 = None
        if tag == 'script' and self._jsonld is not None:
            try:
                self.find_types(json.loads(''.join(self._jsonld)))
            except (ValueError, TypeError):
                self.schema_types.append('INVALID_JSON_LD')
            self._jsonld = None
        if tag in ('script', 'style'):
            self._skip = max(0, self._skip - 1)
        if tag == 'main':
            self._main = max(0, self._main - 1)

    def find_types(self, value):
        if isinstance(value, dict):
            types = value.get('@type', [])
            self.schema_types.extend(types if isinstance(types, list) else [types])
            for child in value.values():
                self.find_types(child)
        elif isinstance(value, list):
            for child in value:
                self.find_types(child)

    def values(self, name):
        return [a.get('content', '') for a in self.meta if a.get('name', a.get('property', '')).lower() == name]


def capture(url):
    try:
        status, final, headers, body = fetch(url)
        page = Page()
        page.feed(body)
        main = ' '.join(' '.join(page.main_text).split())
        same_page_fragments = []
        internal_paths = set()
        for href in page.links:
            target = urllib.parse.urlsplit(urllib.parse.urljoin(final, href))
            try:
                resolved = safe_url(href, final)
            except ValueError:
                continue
            internal_paths.add(urllib.parse.urlsplit(resolved).path)
            if resolved == safe_url(final) and target.fragment and urllib.parse.unquote(target.fragment) not in page.ids:
                same_page_fragments.append(target.fragment)
        return {'requested_url': url, 'final_url': final, 'status': status,
                'content_type': headers.get('Content-Type', headers.get('content-type', '')),
                'titles': page.titles, 'descriptions': page.values('description'),
                'canonicals': page.canonicals, 'robots': page.values('robots'),
                'x_robots_tag': headers.get('X-Robots-Tag', headers.get('x-robots-tag')),
                'h1s': page.h1s, 'og_title': page.values('og:title'),
                'og_description': page.values('og:description'), 'schema_types': sorted(set(page.schema_types)),
                'internal_paths': sorted(internal_paths), 'images': page.images,
                'missing_same_page_fragments': sorted(set(same_page_fragments)),
                'main_text_sha256': hashlib.sha256(main.encode()).hexdigest(),
                'main_text_characters': len(main), 'main_element_present': bool(main)}
    except Exception as error:
        return {'requested_url': url, 'error': f'{type(error).__name__}: {error}'}


def discover(max_pages):
    queue = [ORIGIN + '/sitemap.xml', ORIGIN + '/sitemap-index.xml']
    seen, urls, errors = set(), set(), []
    while queue and len(seen) < 20:
        url = queue.pop(0)
        if url in seen:
            continue
        seen.add(url)
        try:
            status, final, _, body = fetch(url)
            if status != 200:
                errors.append({'url': url, 'status': status})
                continue
            root = ET.fromstring(body)
            locations = [safe_url(e.text.strip(), final) for e in root.iter() if e.tag.rsplit('}', 1)[-1] == 'loc' and e.text]
            if root.tag.rsplit('}', 1)[-1] == 'sitemapindex':
                queue.extend(locations)
            else:
                urls.update(locations)
        except Exception as error:
            errors.append({'url': url, 'error': f'{type(error).__name__}: {error}'})
    return sorted(urls)[:max_pages], errors, len(urls) > max_pages


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True)
    parser.add_argument('--url', action='append', default=[])
    parser.add_argument('--max-pages', type=int, default=150)
    args = parser.parse_args()
    if not 1 <= args.max_pages <= 500:
        parser.error('--max-pages must be 1..500')
    urls, discovery_errors, truncated = discover(args.max_pages) if not args.url else ([], [], False)
    urls = sorted(set(urls + [safe_url(u) for u in args.url]))
    if not urls:
        parser.error('No sitemap URLs discovered; supply explicit --url routes. No successful baseline was written.')
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        pages = list(pool.map(capture, urls))
    result = {'origin': ORIGIN, 'captured_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'read_only': True, 'truncated': truncated, 'discovery_errors': discovery_errors, 'pages': pages,
              'limitations': ['Public server HTML, not browser execution or Sanity inventory.',
                              'Redirects are followed; this does not record every intermediate hop.',
                              'Main text hash is evidence of rendered copy, not a backup of the copy.',
                              'No forms submitted, API routes crawled, credentials used or marketing sent.']}
    Path(args.output).write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({'pages': len(pages), 'errors': sum('error' in p for p in pages),
                      'non_200': sum(p.get('status', 200) != 200 for p in pages),
                      'missing_fragment_pages': sum(bool(p.get('missing_same_page_fragments')) for p in pages)}))
    return 1 if any('error' in p or p.get('status') != 200 for p in pages) else 0


if __name__ == '__main__':
    raise SystemExit(main())
