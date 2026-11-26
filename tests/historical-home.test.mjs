import test from 'node:test';
import assert from 'node:assert/strict';
import {historicalHomeRows,summarizeHistoricalRows} from '../scripts/home-right.mjs';
test('archive order is not evidence; finals excluded and probability subset conserved',()=>{const m={id:'x',home:'A',away:'B',round:'1. Runde',status:'completed'};const a=[{season:'1935',matches:[m,{...m,id:'f',round:'Finale'}]}];const r=historicalHomeRows([],a,[]);assert.equal(r.length,2);assert.ok(r.every(x=>x.home===null));assert.equal(summarizeHistoricalRows(r)[0].unknown,1);const known=historicalHomeRows([],a,[{matchId:'x',formalHome:'A',probabilities:{A:.5,B:.5}}]);assert.equal(summarizeHistoricalRows(known).reduce((n,x)=>n+x.expected,0),1);});
