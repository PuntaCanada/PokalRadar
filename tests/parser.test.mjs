import test from 'node:test';import assert from 'node:assert/strict';import {parseCup,score,splitMatch} from '../scripts/parser.mjs';
test('two source formats',()=>{assert.deepEqual(splitMatch('  20:00  Hertha BSC  v Bayern München  1-2 (0-1)'),['Hertha BSC','Bayern München','1-2 (0-1)']);assert.deepEqual(splitMatch('  20:00  Hertha BSC  1-2 (0-1)  Bayern München'),['Hertha BSC','Bayern München','1-2 (0-1)']);});
test('penalties separate',()=>{const s=score('5-3 pen. 3-3 a.e.t. (3-3, 1-2)');assert.deepEqual(s.penalties,[5,3]);assert.deepEqual(s.playedScore,[3,3]);assert.deepEqual(s.regular,[3,3]);});
test('unknown regulation score',()=>assert.equal(score('1-0 a.e.t. (0-0)').regular,null));
test('awarded score is not played goals',()=>assert.equal(score('2-0 [awarded]').playedScore,null));
test('neutral final and unknown venue',()=>{const [m]=parseCup('▪ Final\nSat May 24\n 20:00  Arminia Bielefeld  v VfB Stuttgart  2-4 (0-3)','2024-25');assert.equal(m.neutral,true);assert.equal(m.venue,null);assert.equal(m.winner,'VfB Stuttgart');});

test('real numeric club name',()=>assert.deepEqual(splitMatch('15:30  Chemnitzer FC            2-3 pen. 2-2 a.e.t. (1-1, 0-0)  1899 Hoffenheim'),['Chemnitzer FC','1899 Hoffenheim','2-3 pen. 2-2 a.e.t. (1-1, 0-0)']));

import {readFileSync} from 'node:fs';import {validate} from '../scripts/validate.mjs';import {canonicalName} from '../scripts/identities.mjs';
test('all seven historical seasons and exact bracket counts',()=>{for(let y=2018;y<=2024;y++){const s=y+'-'+String(y+1).slice(-2);const m=parseCup(readFileSync('data/sources/openfootball/'+s+'/cup.txt','utf8'),s);assert.equal(m.length,63);assert.equal(validate(m),true);}});
test('actual Münster awarded match',()=>{const m=parseCup(readFileSync('data/sources/openfootball/2021-22/cup.txt','utf8'),'2021-22').find(m=>m.home==='Preußen Münster'&&m.away==='VfL Wolfsburg');assert.deepEqual(m.result.awardedScore,[2,0]);assert.equal(m.result.playedScore,null);assert.equal(m.winner,'Preußen Münster');});
test('actual 2022 final',()=>{const m=parseCup(readFileSync('data/sources/openfootball/2021-22/cup.txt','utf8'),'2021-22').find(m=>m.round===6);assert.deepEqual(m.result.regular,[1,1]);assert.deepEqual(m.result.extraTime,[1,1]);assert.deepEqual(m.result.penalties,[2,4]);assert.equal(m.winner,'RB Leipzig');assert.equal(m.neutral,true);});
test('explicit aliases preserve reserve teams',()=>{assert.equal(canonicalName('FC Bayern München'),'Bayern München');assert.notEqual(canonicalName('Bayern München II'),canonicalName('FC Bayern München'));});
