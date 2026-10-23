import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('capture', Path(__file__).resolve().parents[1] / 'scripts' / 'capture-seo-baseline.py')
capture = importlib.util.module_from_spec(spec)
spec.loader.exec_module(capture)


class BaselineTests(unittest.TestCase):
    def test_scope_rejects_external_api_and_credential_urls(self):
        for value in ['https://other.example/', 'https://ziaflow.com/api/contact',
                      'https://ziaflow.com/_api/forms/audit', 'https://user@ziaflow.com/',
                      'https://ziaflow.com:9000/']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                capture.safe_url(value)

    def test_query_data_is_not_persisted(self):
        self.assertEqual(capture.safe_url('/contact?email=private@example.com#form'),
                         'https://ziaflow.com/contact')

    def test_metadata_and_nested_headings(self):
        page = capture.Page()
        page.feed('<title>A &amp; B</title><meta name="description" content="One">'
                  '<meta name="description" content="Two"><main><h1>Lead <span>capture</span></h1>'
                  '<p>Useful text</p><script>secret script text</script></main>'
                  '<script type="application/ld+json">{"@graph":[{"@type":"Organization"}]}</script>')
        self.assertEqual(page.titles, ['A & B'])
        self.assertEqual(page.h1s, ['Lead capture'])
        self.assertEqual(page.values('description'), ['One', 'Two'])
        self.assertEqual(page.schema_types, ['Organization'])
        self.assertNotIn('secret script text', ''.join(page.main_text))

    def test_missing_fragment_is_visible(self):
        html = '<main><h1>Home</h1><a href="#missing">Ask</a><a href="#exists">Ok</a><div id="exists"></div></main>'
        with patch.object(capture, 'fetch', return_value=(200, capture.ORIGIN + '/', {}, html)):
            result = capture.capture(capture.ORIGIN + '/')
        self.assertEqual(result['missing_same_page_fragments'], ['missing'])

    def test_404_is_not_reported_as_a_successful_html_baseline(self):
        with patch.object(capture, 'fetch', return_value=(404, capture.ORIGIN + '/', {}, 'NOT_FOUND')):
            result = capture.capture(capture.ORIGIN + '/')
        self.assertEqual(result['status'], 404)
        self.assertEqual(result['titles'], [])
        self.assertFalse(result['main_element_present'])

    def test_timeout_remains_unknown(self):
        with patch.object(capture, 'fetch', side_effect=TimeoutError('unavailable')):
            result = capture.capture(capture.ORIGIN + '/')
        self.assertIn('TimeoutError', result['error'])
        self.assertNotIn('status', result)


if __name__ == '__main__':
    unittest.main()
