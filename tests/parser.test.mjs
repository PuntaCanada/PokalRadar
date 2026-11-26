import test from 'node:test';import assert from 'node:assert/strict';import {parseCup,score,splitMatch} from '../scripts/parser.mjs';
test('two source formats',()=>{assert.deepEqual(splitMatch('  20:00  Hertha BSC  v Bayern München  1-2 (0-1)'),['Hertha BSC','Bayern München','1-2 (0-1)']);assert.deepEqual(splitMatch('  20:00  Hertha BSC  1-2 (0-1)  Bayern München'),['Hertha BSC','Bayern München','1-2 (0-1)']);});
test('penalties separate',()=>{const s=score('5-3 pen. 3-3 a.e.t. (3-3, 1-2)');assert.deepEqual(s.penalties,[5,3]);assert.deepEqual(s.playedScore,[3,3]);assert.deepEqual(s.regular,[3,3]);});
test('unknown regulation score',()=>assert.equal(score('1-0 a.e.t. (0-0)').regular,null));
test('awarded score is not played goals',()=>assert.equal(score('2-0 [awarded]').playedScore,null));
test('neutral final and unknown venue',()=>{const [m]=parseCup('▪ Final\nSat May 24\n 20:00  Arminia Bielefeld  v VfB Stuttgart  2-4 (0-3)','2024-25');assert.equal(m.neutral,true);assert.equal(m.venue,null);assert.equal(m.winner,'VfB Stuttgart');});
