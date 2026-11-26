import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
// Separate staging schema: never mutates the verified production archive.
export function importArchive(text,season,source){
 const matches=[], ids=new Set(); let round=null,date=null,time=null,goals=false;
 const months='Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
 const pair=s=>s?s.split('-').map(Number):null;
 for(const [i,line] of text.split(/\r?\n/).entries()){
  const l=line.trim(); if(!l||/^[=#]/.test(l))continue;
  if(l.startsWith('▪')){round=l.slice(1).trim();date=null;time=null;goals=false;continue;}
  const d=l.match(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (\w{3}) (\d+)(?: (\d{4}))?$/);
  if(d){const m=months.indexOf(d[1])+1;if(!m)throw Error(l);date=(d[3]||Number(season.slice(0,4))+(m<7?1:0))+'-'+String(m).padStart(2,'0')+'-'+d[2].padStart(2,'0');time=null;goals=false;continue;}
  if(goals||l.startsWith('(')){goals=!l.endsWith(')');continue;}
  const t=l.match(/^(\d{1,2}:\d{2})\s+/);if(t)time=t[1];
  const row=l.replace(/^\d{1,2}:\d{2}\s+/,'').match(/^(.+?)\s+v\s+(.+?)(?:\s{2,}(\d+-\d+.*))?$/);
  if(!row||!round)throw Error('Unparsed line '+(i+1)+': '+l);
  const [,home,away,raw]=row;if(home==='N.N.'||away==='N.N.')continue;
  const s=raw?.match(/^(\d+-\d+)(?:\s+(aet|a\.e\.t\.))?(?:\s+\((\d+-\d+)(?:,\s*(\d+-\d+))?\))?(?:,\s*(\d+-\d+)\s+pen)?$/);
  if(raw&&!s)throw Error('Unparsed score '+raw);
  const final=pair(s?.[1]),penalties=pair(s?.[5]),extra=s?.[2]?true:null;
  // Unmarked extra time and inconsistent intermediate scores remain unknown.
  const status=raw?'result-reported':'scheduled-or-unreported';
  const id=createHash('sha256').update(JSON.stringify([season,round,date,home,away])).digest('hex').slice(0,24);
  if(ids.has(id))throw Error('Duplicate '+id);ids.add(id);
  matches.push({id,season,round,date,time,home,away,status,reportedScore:final,penalties,extraTime:extra,halfTime:null,regular:null,winner:null,formalHome:null,neutral:null,venue:null,homeTier:null,awayTier:null,source:{url:source,line:i+1},raw:raw??null});
 }
 return matches;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const [file,season,source]=process.argv.slice(2);if(!file||!season||!source)throw Error('file season source required');
 console.log(JSON.stringify(importArchive(readFileSync(file,'utf8'),season,source),null,2));
}
