import {test} from 'node:test';import assert from 'node:assert/strict';import {importArchive} from '../scripts/archive-import.mjs';
test('variable rounds, replay, unknown scores and penalties',()=>{
 const rows=importArchive('▪ Vorrunde\nSat Aug 1 1953\n  15:00 A v B  1-1\nSun Aug 2\n A v B  2-1\n▪ Endspiel\nSun Aug 9\n A v C\n D v N.N.\n','1953-54','fixture');
 assert.equal(rows.length,3);assert.equal(new Set(rows.map(r=>r.id)).size,3);assert.equal(rows[2].reportedScore,null);assert.equal(rows[0].winner,null);
});
test('penalties kept separate',()=>{const [r]=importArchive('▪ Final\nSat May 1 2021\n A v B  1-1 aet (1-1, 0-0), 5-4 pen','2020-21','fixture');assert.deepEqual(r.penalties,[5,4]);assert.deepEqual(r.reportedScore,[1,1]);});
test('reject unknown input',()=>assert.throws(()=>importArchive('▪ Final\ninvalid','2020-21','fixture')));
