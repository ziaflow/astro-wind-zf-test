import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location(
    'intake', Path(__file__).resolve().parents[1] / 'scripts' / 'check-intake-boundary.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class BoundaryTests(unittest.TestCase):
    def test_only_empty_payload_and_negative_evidence_are_used(self):
        calls = []
        def fetch(path, method, data):
            calls.append((path, method, data))
            return ((200, '<form action="/api/contact"></form>') if method == 'GET'
                    else (400, '{"message":"A valid email is required"}'))
        result = module.check(fetch)
        self.assertEqual(calls, [('/contact', 'GET', None), ('/api/contact', 'POST', b'{}')])
        self.assertTrue(result['negative_boundary_passed'])
        self.assertFalse(result['release_ready'])

    def test_external_missing_or_duplicate_forms_stop_before_post(self):
        for html in ('<form action="https://other.example"></form>', '',
                     '<form action="/api/contact"></form><form action="/other"></form>'):
            calls = []
            def fetch(path, method, data):
                calls.append(method)
                return 200, html
            self.assertFalse(module.check(fetch)['negative_boundary_passed'])
            self.assertEqual(calls, ['GET'])

    def test_200_500_redirect_and_unrelated_400_do_not_pass(self):
        for code, body in ((200, '{}'), (500, '{}'), (302, ''), (400, '{"message":"other"}')):
            def fetch(path, method, data):
                return ((200, '<form action="/api/contact"></form>') if method == 'GET' else (code, body))
            self.assertFalse(module.check(fetch)['negative_boundary_passed'])

    def test_timeout_is_unknown_without_response_details(self):
        def fetch(*args):
            raise TimeoutError('sensitive upstream response')
        result = module.check(fetch)
        self.assertEqual(result['error_type'], 'TimeoutError')
        self.assertNotIn('sensitive', str(result))
        self.assertFalse(result['negative_boundary_passed'])

    def test_transport_rejects_any_valid_contact_payload_before_network(self):
        with self.assertRaises(ValueError):
            module.request('/api/contact', 'POST', b'{"email":"qa@example.com"}')


if __name__ == '__main__':
    unittest.main()
