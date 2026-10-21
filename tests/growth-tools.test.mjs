import test from 'node:test';
import assert from 'node:assert/strict';
import {tools,assess,estimate,stackSummary} from '../src/lib/growth-tools/engine.mjs';
test('unanswered is unscored',()=>assert.equal(assess('local-visibility-check',{}).score,null));
for(const tool of tools.filter(t=>t.kind!=='estimate')){
 test(tool.slug+' all yes',()=>assert.equal(assess(tool.slug,Object.fromEntries(tool.questions.map(q=>[q[0],'yes']))).score,100));
 test(tool.slug+' all unknown',()=>assert.equal(assess(tool.slug,Object.fromEntries(tool.questions.map(q=>[q[0],'unknown']))).score,null));
 test(tool.slug+' all not applicable',()=>assert.equal(assess(tool.slug,Object.fromEntries(tool.questions.map(q=>[q[0],'na']))).score,null));
}
test('coverage and provisional completion',()=>{const r=assess('local-visibility-check',{profile:'yes'});assert.equal(r.score,100);assert.equal(r.coverage,13);assert.equal(r.complete,false);});
test('baseline is transparent',()=>{const r=estimate({});assert.equal(r.hours,68);assert.equal(r.low,6800);assert.equal(r.high,9180);});
test('scope changes estimate',()=>assert.ok(estimate({commerce:true}).low>estimate({}).low));
test('invalid estimator inputs rejected',()=>{for(const pages of [NaN,Infinity,-1,101,1.1])assert.throws(()=>estimate({pages}));});
test('invalid answers rejected',()=>assert.throws(()=>assess('local-visibility-check',{profile:'malformed'})));
test('inventory overlap normalized',()=>{const r=stackSummary([{name:'A',function:' CRM ',cost:20,hours:2},{name:'B',function:'crm',cost:30,hours:1}]);assert.equal(r.monthlyCost,50);assert.equal(r.overlapCandidates.length,1);});
test('negative costs rejected',()=>assert.throws(()=>stackSummary([{name:'X',function:'CRM',cost:-1,hours:0}])));
