import {createHash} from 'node:crypto';
export const rounds=['Round 1','Round 2','Round of 16','Quarterfinals','Semifinals','Final'];
const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export function splitMatch(line){
 const l=line.trim().replace(/^\d{1,2}:\d{2}\s+/,'');
 const a=l.match(/^(.+?)\s+v\s+(.+?)\s{2,}(\d+-\d+.*)$/);
 if(a)return [a[1].trim(),a[2].trim(),a[3].trim()];
 const b=l.match(/^(.+?)\s{2,}(\d+-\d+.*?)\s{2,}(.+)$/);
 if(b)return [b[1].trim(),b[3].replace(/\s*\[awarded\]$/,'').trim(),b[2]+(l.includes('[awarded]')?' [awarded]':'')];
 return null;
}
const pair=s=>s.split('-').map(Number);
export function score(raw){
 const m=raw.match(/^(\d+-\d+)(?:\s+pen\.\s+(\d+-\d+))?(?:\s+(a\.e\.t\.))?(?:\s+\(([^)]+)\))?/);
 if(!m)throw Error('Invalid score '+raw);
 const penalties=m[2]?pair(m[1]):null, final=pair(m[2]||m[1]), extra=!!m[3], awarded=raw.includes('[awarded]');
 const regular=awarded?null:extra?(m[4]?.includes(',')?pair(m[4].split(',')[0].trim()):null):final;
 const deciding=penalties||final;
 if(deciding[0]===deciding[1])throw Error('Undecided '+raw);
 return {regular,extraTime:extra?final:null,penalties,awardedScore:awarded?final:null,playedScore:awarded?null:final,winnerSide:deciding[0]>deciding[1]?'home':'away',status:awarded?'awarded':'completed'};
}
export function parseCup(text,season){
 let round,date,time=null,year=Number(season.slice(0,4));const out=[];
 for(const [i,line] of text.split(/\r?\n/).entries()){
 const l=line.trim();if(!l||/^[=#]/.test(l))continue;
 if(l.startsWith('▪')){round=rounds.indexOf(l.slice(1).trim())+1; if(!round)throw Error('Unknown round '+l);continue;}
 const d=l.match(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\w{3})\s+(\d+)(?:\s+(\d{4}))?$/);
 if(d){const month=months.indexOf(d[1])+1;if(!month)throw Error(l);date=(d[3]||String(year+(month<7?1:0)))+'-'+String(month).padStart(2,'0')+'-'+d[2].padStart(2,'0');time=null;continue;}
 const match=splitMatch(line);if(!match)throw Error(season+':'+(i+1)+' '+l);
 const tm=l.match(/^(\d{1,2}:\d{2})\s/);if(tm)time=tm[1];
 const [home,away,raw]=match;if(!date||!round)throw Error('Missing context');
 const result=score(raw);const id=createHash('sha256').update(JSON.stringify([season,round,home,away])).digest('hex').slice(0,24);
 out.push({id,competition:'dfb-pokal-men',season,round,date,time,home,away,homeTier:null,awayTier:null,homePot:null,awayPot:null,formalHome:null,homeRightReason:null,venue:null,neutral:round===6?true:null,result,winner:result.winnerSide==='home'?home:away,source:{file:season+'/cup.txt',line:i+1},raw});
 }
 return out;
}
export function leagueTeams(text){const teams=new Set();for(const l of text.split(/\r?\n/)){const m=splitMatch(l);if(m){teams.add(m[0]);teams.add(m[1]);}}return teams;}
