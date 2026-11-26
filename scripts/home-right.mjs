import {readFileSync,readdirSync} from 'node:fs';
import {evaluateDraw} from './draw-evidence.mjs';
import {canonicalName} from './identities.mjs';
export function summarizeHome(seasons,observations){
 const byMatch=new Map();for(const o of observations){if(byMatch.has(o.matchId))throw Error('Duplicate evidence');byMatch.set(o.matchId,o);}
 const clubs=new Map(),matches=seasons.flatMap(s=>s.matches).filter(m=>m.round<6).sort((a,b)=>a.season.localeCompare(b.season)||a.round-b.round||a.date.localeCompare(b.date));
 for(const m of matches){const o=byMatch.get(m.id);if(o&&![m.home,m.away].includes(o.formalHome))throw Error('Invalid home evidence');
 for(const name of [m.home,m.away]){const id=canonicalName(name);if(!clubs.has(id))clubs.set(id,{name:id,total:0,known:0,home:0,away:0,modeled:0,expected:0,modeledHome:0,run:0,longest:0});const c=clubs.get(id);c.total++;if(!o){c.run=0;continue;}c.known++;const home=o.formalHome===name;c.home+=Number(home);c.away+=Number(!home);c.run=home?0:c.run+1;c.longest=Math.max(c.longest,c.run);const p=o.probabilities?.[name];if(Number.isFinite(p)){c.modeled++;c.expected+=p;c.modeledHome+=Number(home);}}
 }
 return {total:matches.length,known:matches.filter(m=>byMatch.has(m.id)).length,clubs:[...clubs.values()]};
}
export function loadHome(seasons){
 const obs=[];for(const file of readdirSync('data/draw-evidence').filter(f=>f.endsWith('.json')).sort()){const e=JSON.parse(readFileSync('data/draw-evidence/'+file,'utf8')),rows=evaluateDraw(e,seasons);for(const m of e.matches)obs.push({matchId:m.matchId,formalHome:m.formalHome,source:m.pairingSource,probabilities:Object.fromEntries(rows.filter(r=>r.matchId===m.matchId).map(r=>[r.id,r.homeProbability]))});}
 for(const e of JSON.parse(readFileSync('data/home-right-only.json','utf8'))){for(const [matchId,home,away] of e.pairs){const m=seasons.find(s=>s.season===e.season)?.matches.find(m=>m.id===matchId);if(!m||m.round!==e.round||m.home!==home||m.away!==away)throw Error('Home evidence mismatch');obs.push({matchId,formalHome:home,source:e.source,probabilities:null});}}
 return {observations:obs,...summarizeHome(seasons,obs)};
}
