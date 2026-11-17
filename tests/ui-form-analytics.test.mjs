import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const source = readFileSync('src/components/ui/Form.astro', 'utf8');
const start = source.indexOf('              const eligible = data &&');
const end = source.indexOf('\n            } catch (cioErr)', start);
assert.ok(start >= 0 && end > start);
const block = source.slice(start,end);
function dispatch(data, actionUrl, host = 'ziaflow.com') {
 const events=[]; const window={ __zfIsProdHost:true, location:{ hostname:host, pathname:'/contact', href:'https://ziaflow.com/contact?secret=1' }, analytics:{identify(...a){events.push(['identify', ...a]);},track(...a){events.push(a);} } };
 try { runInNewContext(block, { data, actionUrl, window, formData: new Map([['email','a@business.com'],['message','private'],['phone','555']]), Date }); } catch {} return events;
}
test('verified contact emits lead without private event properties', () => { const events=dispatch({ submission_id:'id', duplicate:false, is_test:false, analytics_eligible:true }, '/api/contact'); assert.equal(events[0][0], 'identify'); assert.equal(events[1][0], 'contact_form_submitted'); assert.deepEqual(Object.keys(events[1][1]).sort(), ['page_path','service_interest']); });
test('Web3Forms uses an anonymous unverified event only after success', () => { const events=dispatch({ success:true }, 'https://api.web3forms.com/submit'); assert.equal(events.length,1); assert.equal(events[0][0], 'contact_form_submitted_unverified'); assert.equal(dispatch({ success:false }, 'https://api.web3forms.com/submit').length,0); assert.equal(dispatch({ success:true }, 'https://api.web3forms.com/submit', 'preview.example.com').length,0); assert.equal(dispatch({ success:true }, '/api/contact').length,0); });
