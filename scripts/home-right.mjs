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

export function historicalHomeRows(seasons,archive,observations){
 const evidence=new Map(observations.map(o=>[o.matchId,o]));
 const rows=[];
 const name=(n,s)=>canonicalName(s>='2008-09'&&s<='2017-18'?n.replace(/\s+\([IVX]+\)$/,''):n);
 for(const s of [...seasons,...archive])for(const m of s.matches){
 if(m.round===6||/^(Finale|Endspiel|Final)$/i.test(String(m.round)))continue;
 const o=evidence.get(m.id),status=m.result?.status??m.status;
 for(const [n,other] of [[m.home,m.away],[m.away,m.home]]){
 const p=o?.probabilities?.[n];
 rows.push({season:s.season,id:m.id,club:name(n,s.season),opponent:name(other,s.season),date:m.date??null,round:m.round,status,home:o?o.formalHome===n:null,probability:Number.isFinite(p)?p:null,venue:m.venue??null,source:o?.source??null,replay:m.replay===true});
 }}
 return rows;
}
function streaks(rows){const runs=new Map();const ordered=[...rows].sort((a,b)=>a.season.localeCompare(b.season)||String(a.date??'').localeCompare(String(b.date??''))||a.id.localeCompare(b.id));for(const r of ordered){if(!runs.has(r.club))runs.set(r.club,{home:0,away:0,longHome:0,longAway:0,season:null});const x=runs.get(r.club);if(x.season!==r.season){x.home=x.away=0;x.season=r.season;}if(r.home===null||!r.date||r.replay){x.home=x.away=0;continue;}x.home=r.home?x.home+1:0;x.away=r.home?0:x.away+1;x.longHome=Math.max(x.longHome,x.home);x.longAway=Math.max(x.longAway,x.away);}return runs;}
export function summarizeHistoricalRows(rows){
 const clubs=new Map();
 for(const r of rows){
 if(!clubs.has(r.club))clubs.set(r.club,{name:r.club,total:0,known:0,home:0,away:0,unknown:0,modeled:0,expected:0,modeledHome:0});
 const c=clubs.get(r.club);c.total++;if(r.home===null)c.unknown++;else{c.known++;c.home+=Number(r.home);c.away+=Number(!r.home);}
 if(r.home!==null&&Number.isFinite(r.probability)){c.modeled++;c.expected+=r.probability;c.modeledHome+=Number(r.home);}
 }
 const runs=streaks(rows);return [...clubs.values()].map(c=>({...c,longHome:runs.get(c.name)?.longHome??0,longAway:runs.get(c.name)?.longAway??0}));
}
