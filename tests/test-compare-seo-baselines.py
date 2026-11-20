import copy
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location(
    'compare', Path(__file__).resolve().parents[1] / 'scripts' / 'compare-seo-baselines.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def snapshot():
    page = {field: [] for field in module.FIELDS}
    page.update(requested_url='https://ziaflow.com/contact',
                final_url='https://ziaflow.com/contact', status=200,
                main_text_sha256='copy-hash', x_robots_tag=None)
    return {'truncated': False, 'pages': [page]}


class ComparisonTests(unittest.TestCase):
    def test_preview_host_matches_path_but_canonical_and_noindex_changes_remain_visible(self):
        a, b = snapshot(), snapshot()
        b['pages'][0].update(requested_url='https://preview.vercel.app/contact/',
                             final_url='https://preview.vercel.app/contact/',
                             canonicals=['https://preview.vercel.app/contact'], robots=['noindex'])
        report = module.compare(a, b)
        self.assertEqual(report['missing_paths'], [])
        self.assertEqual({x['field'] for x in report['changes']}, {'canonicals', 'robots'})
        self.assertEqual(report['status'], 'differences')

    def test_lost_route_and_copy_drift_fail_comparison(self):
        a, b = snapshot(), snapshot()
        extra = copy.deepcopy(a['pages'][0])
        extra['requested_url'] = extra['final_url'] = 'https://ziaflow.com/article'
        a['pages'].append(extra)
        b['pages'][0]['main_text_sha256'] = 'changed'
        result = module.compare(a, b)
        self.assertEqual(result['missing_paths'], ['/article'])
        self.assertEqual(result['changes'][0]['field'], 'main_text_sha256')

    def test_timeout_and_missing_fields_never_match(self):
        for mutation in ('error', 'missing'):
            a, b = snapshot(), snapshot()
            if mutation == 'error':
                b['pages'][0] = {'requested_url': 'https://ziaflow.com/contact', 'error': 'timeout'}
            else:
                del b['pages'][0]['descriptions']
            self.assertEqual(module.compare(a, b)['status'], 'incomplete')

    def test_empty_truncated_and_duplicate_snapshots_are_invalid(self):
        for value in ({'truncated': False, 'pages': []},
                      {'truncated': True, 'pages': snapshot()['pages']},
                      {'truncated': False, 'pages': snapshot()['pages'] * 2}):
            with self.assertRaises(ValueError):
                module.compare(value, snapshot())

    def test_final_path_redirect_is_reported(self):
        a, b = snapshot(), snapshot()
        b['pages'][0]['final_url'] = 'https://ziaflow.com/'
        self.assertEqual(module.compare(a, b)['changes'][0]['field'], 'candidate.redirected_path')

    def test_equal_capture_only_establishes_recorded_field_match(self):
        result = module.compare(snapshot(), snapshot())
        self.assertEqual(result['status'], 'match')
        self.assertIn('not release approval', ' '.join(result['limitations']))


if __name__ == '__main__':
    unittest.main()
