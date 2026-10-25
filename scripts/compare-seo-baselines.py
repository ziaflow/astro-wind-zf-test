#!/usr/bin/env python3
"""Compare saved public HTML captures offline; a match is not release approval."""
import argparse
import json
from pathlib import Path
from urllib.parse import urlsplit

FIELDS = ('titles', 'descriptions', 'canonicals', 'h1s', 'og_title',
          'og_description', 'schema_types', 'robots', 'x_robots_tag',
          'main_text_sha256')


def route(url):
    parsed = urlsplit(url)
    if parsed.scheme not in ('http', 'https') or not parsed.hostname:
        raise ValueError('Capture URL must be absolute HTTP(S)')
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise ValueError('Capture URL must not contain credentials, query or fragment')
    # Match preview paths to production without rewriting captured canonical hosts.
    return parsed.path.rstrip('/') or '/'


def index(snapshot):
    if snapshot.get('truncated') is not False:
        raise ValueError('Snapshot completeness must be explicitly recorded')
    pages = snapshot.get('pages')
    if not isinstance(pages, list) or not pages:
        raise ValueError('Snapshot must contain at least one page')
    result = {}
    for page in pages:
        key = route(page['requested_url'])
        if key in result:
            raise ValueError('Duplicate requested path: ' + key)
        result[key] = page
    return result


def compare(before, after):
    old, new = index(before), index(after)
    missing = sorted(old.keys() - new.keys())
    added = sorted(new.keys() - old.keys())
    changes, unavailable, failed = [], [], []
    for key in sorted(old.keys() | new.keys()):
        for label, pages in (('baseline', old), ('candidate', new)):
            page = pages.get(key)
            if page is not None and (page.get('error') or page.get('status') != 200):
                failed.append({'path': key, 'capture': label,
                               'status': page.get('status'), 'error': page.get('error')})
        if key not in old or key not in new:
            continue
        a, b = old[key], new[key]
        if a.get('error') or b.get('error') or a.get('status') != 200 or b.get('status') != 200:
            continue
        for field in FIELDS:
            if field not in a or field not in b:
                unavailable.append({'path': key, 'field': field})
                continue
            # Keep exact values: canonical host changes and new noindex directives
            # must remain visible even for an intentionally private preview.
            if a[field] != b[field]:
                changes.append({'path': key, 'field': field,
                                'baseline': a[field], 'candidate': b[field]})
        for label, page in (('baseline', a), ('candidate', b)):
            if 'final_url' not in page:
                unavailable.append({'path': key, 'field': label + '.final_url'})
            elif route(page['final_url']) != key:
                changes.append({'path': key, 'field': label + '.redirected_path',
                                'requested_path': key, 'final_path': route(page['final_url'])})
    status = ('incomplete' if failed or unavailable else
              'differences' if missing or added or changes else 'match')
    return {'status': status, 'baseline_captured_at': before.get('captured_at'),
            'candidate_captured_at': after.get('captured_at'),
            'baseline_pages': len(old), 'candidate_pages': len(new),
            'missing_paths': missing, 'added_paths': added, 'changes': changes,
            'unavailable_fields': unavailable, 'failed_captures': failed,
            'limitations': [
                'Offline comparison only; no network requests or form submissions.',
                'A match preserves captured defects too and is not release approval.',
                'Schema types do not establish complete JSON-LD value parity.',
                'Does not verify browser behavior, intermediate redirects, sitemap coverage, '
                'Sanity access, analytics or hosted lead persistence.',
                'Copy hashes compare normalized main text including its order; '
                'intentional layout changes require review, not automatic approval.']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline', required=True)
    parser.add_argument('--candidate', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    try:
        report = compare(json.loads(Path(args.baseline).read_text()),
                         json.loads(Path(args.candidate).read_text()))
    except (ValueError, TypeError, KeyError) as error:
        report = {'status': 'invalid', 'error': str(error)}
    Path(args.output).write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({key: report[key] for key in ('status', 'baseline_pages', 'candidate_pages')
                      if key in report}))
    return {'match': 0, 'differences': 1}.get(report['status'], 2)


if __name__ == '__main__':
    raise SystemExit(main())
