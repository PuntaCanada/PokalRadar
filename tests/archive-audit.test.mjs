import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditCup} from '../scripts/archive-audit.mjs';
test('2025/26 staged snapshot is incomplete and not eligible for production',()=>{
 const r=auditCup(readFileSync('data/archive-staging/2025-26/cup.txt','utf8'));
 assert.equal(r.scored,48);
 assert.equal(r.scheduled,8);
 assert.equal(r.placeholders,3);
 assert.equal(r.unparsed,0);
 assert.equal(r.modernShapeComplete,false);
});
test('existing modern source has expected round counts',()=>{
 const r=auditCup(readFileSync('data/sources/openfootball/2024-25/cup.txt','utf8'));
 assert.equal(r.scored,63);
 assert.equal(r.modernShapeComplete,true);
});
