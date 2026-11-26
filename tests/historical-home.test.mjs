import test from 'node:test';
import assert from 'node:assert/strict';
import {historicalHomeRows,summarizeHistoricalRows} from '../scripts/home-right.mjs';
test('archive order is not evidence; finals excluded and probability subset conserved',()=>{const m={id:'x',home:'A',away:'B',round:'1. Runde',status:'completed'};const a=[{season:'1935',matches:[m,{...m,id:'f',round:'Finale'}]}];const r=historicalHomeRows([],a,[]);assert.equal(r.length,2);assert.ok(r.every(x=>x.home===null));assert.equal(summarizeHistoricalRows(r)[0].unknown,1);const known=historicalHomeRows([],a,[{matchId:'x',formalHome:'A',probabilities:{A:.5,B:.5}}]);assert.equal(summarizeHistoricalRows(known).reduce((n,x)=>n+x.expected,0),1);});

test('unknown rights break both dated within-season streaks',()=>{const rows=[true,true,null,true,false,false].map((home,i)=>({club:'A',season:'1935',date:'1935-01-0'+(i+1),id:String(i),home,probability:null}));const c=summarizeHistoricalRows(rows)[0];assert.equal(c.longHome,2);assert.equal(c.longAway,2);assert.equal(c.unknown,1);});

test('known away streak spans seasons',()=>{const c=summarizeHistoricalRows([{club:'A',season:'2020-21',date:'2020-09-01',id:'1',home:false},{club:'A',season:'2021-22',date:'2021-09-01',id:'2',home:false}])[0];assert.equal(c.longAway,2);});
