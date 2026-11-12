#!/usr/bin/env python3
"""On-demand negative intake check. Never submits contact details or proves persistence."""
import argparse
import datetime
from html.parser import HTMLParser
import json
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request

ORIGIN = 'https://ziaflow.com'


class Forms(HTMLParser):
    def __init__(self):
        super().__init__()
        self.actions = []

    def handle_starttag(self, tag, attrs):
        if tag == 'form':
            self.actions.append(dict(attrs).get('action', ''))


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # A redirect must not silently rewrite the diagnostic POST.


def request(path, method, data):
    if (path, method, data) not in (('/contact', 'GET', None), ('/api/contact', 'POST', b'{}')):
        raise ValueError('Only the fixed empty-input diagnostic is allowed')
    req = urllib.request.Request(ORIGIN + path, data=data, method=method,
                                 headers={'Content-Type': 'application/json', 'Origin': ORIGIN,
                                          'User-Agent': 'ZiaFlow-Intake-Negative-QA/1.0'})
    try:
        response = urllib.request.build_opener(NoRedirect()).open(req, timeout=20)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        limit = 4_000_000 if method == 'GET' else 16_000
        body = response.read(limit + 1)
        if len(body) > limit:
            raise ValueError('Diagnostic response exceeded its capture limit')
        return response.status, body.decode('utf-8', errors='replace')


def check(fetch=request):
    report = {'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'origin': ORIGIN, 'release_ready': False,
              'limitations': ['Only server HTML and one fixed empty JSON rejection are checked.',
                              'No valid lead, browser submission, durable receipt, provider event, '
                              'email, consent, booking or delivery was tested.',
                              'A passing negative boundary is not end-to-end or release acceptance.']}
    try:
        status, html = fetch('/contact', 'GET', None)
        forms = Forms()
        forms.feed(html)
        targets = [urllib.parse.urlsplit(urllib.parse.urljoin(ORIGIN + '/contact', a))
                   for a in forms.actions]
        expected = sum(t.scheme == 'https' and t.netloc == 'ziaflow.com'
                       and t.path == '/api/contact' and not t.query for t in targets)
        external = sum(t.netloc != 'ziaflow.com' or t.scheme != 'https' for t in targets)
        report.update(contact_status=status, form_count=len(targets),
                      contact_api_form_count=expected, external_form_count=external)
        # Do not exercise the API when the UI is missing or points elsewhere.
        if status != 200 or len(targets) != 1 or expected != 1 or external:
            report['negative_boundary_passed'] = False
            return report
        api_status, body = fetch('/api/contact', 'POST', b'{}')
        try:
            payload = json.loads(body)
            message = payload.get('message', '') if isinstance(payload, dict) else ''
        except (ValueError, TypeError):
            message = ''
        rejected_email = isinstance(message, str) and 'valid email' in message.lower()
        report.update(invalid_api_status=api_status, invalid_email_rejected=rejected_email,
                      negative_boundary_passed=api_status == 400 and rejected_email)
    except Exception as error:
        # No response bodies/URLs/headers in output: they can contain provider data.
        report.update(negative_boundary_passed=False, error_type=type(error).__name__)
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', action='store_true', help='Explicitly permit the fixed GET and empty-input POST')
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    if not args.run:
        parser.error('Use --run for the on-demand negative check; no network requests were made')
    report = check()
    Path(args.output).write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report))
    return 0 if report['negative_boundary_passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
