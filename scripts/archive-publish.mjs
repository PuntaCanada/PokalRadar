import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=process.argv[2]||'archive-sources';
const manifest=JSON.parse(readFileSync(root+'/manifest.json','utf8'));
function read(path){const b=readFileSync(root+'/'+path);const m=manifest.find(x=>x.file===path);if(!m||createHash('sha256').update(b).digest('hex')!==m.sha256)throw Error('Source hash mismatch '+path);return JSON.parse(b);}
const seasons=[];
for(const year of [2025,2026]){
 const rows=read('openligadb/'+year+'.json'), matches=[];
 for(const m of rows){
 const types=new Map(m.matchResults.map(r=>[r.resultTypeID,[r.pointsTeam1,r.pointsTeam2]]));
 const finished=m.matchIsFinished===true, extra=types.get(4)||types.get(3)||null, final=finished?(extra||types.get(2)):null, penalties=finished?(types.get(5)||null):null;
 if(finished&&(!final||[...final,...(penalties||[])].some(x=>!Number.isSafeInteger(x)||x<0)))throw Error('Invalid score '+m.matchID);
 const decision=penalties||final;
 matches.push({id:'oldb-'+m.matchID,round:m.group.groupName,date:m.matchDateTime.slice(0,10),time:m.matchDateTime.slice(11,16),home:m.team1.teamName.trim(),away:m.team2.teamName.trim(),score:final,penalties,halfTime:finished?(types.get(1)||null):null,regular:finished&&!extra&&!penalties?final:null,extraTime:extra?true:null,status:finished?'completed':'scheduled',winner:decision&&decision[0]!==decision[1]?(decision[0]>decision[1]?m.team1.teamName.trim():m.team2.teamName.trim()):null,homeTier:null,awayTier:null,formalHome:null,venue:null});
 }
 if(new Set(matches.map(m=>m.id)).size!==matches.length)throw Error('Duplicate source ID');
 if(matches.some(m=>m.status==='completed'&&!m.winner))throw Error('Undecided modern match');
 seasons.push({season:year+'-'+String(year+1).slice(2),source:'https://api.openligadb.de/getmatchdata/dfb/'+year,license:'ODbL-1.0',matches});
}
const clean=s=>s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(_,a,b)=>b||a).replace(/'''/g,'').trim();
function split(s){let depth=0,br=0,start=0,out=[];for(let i=0;i<s.length;i++){const p=s.slice(i,i+2);if(p==='{{'){depth++;i++;}else if(p==='}}'){depth--;i++;}else if(p==='[['){br++;i++;}else if(p===']]'){br--;i++;}else if(s[i]==='|'&&!depth&&!br){out.push(s.slice(start,i));start=i+1;}}out.push(s.slice(start));return out;}
for(const [file,season,finalDate] of [['Tschammerpokal_1935','1935','1935-12-08'],['DFB-Pokal_1952-53','1952-53','1953-05-01']]){
 const p=read('wikipedia/'+file+'.json').parse, matches=[];let round=null,replay=false,bye=0;
 for(const line of p.wikitext.split('\n')){
 const h=line.match(/^== ([^=]+) ==$/);if(h){round=h[1];replay=false;}
 if(/^=== Wiederholung/.test(line))replay=true;
 if(!line.startsWith('{{OneLegResult|'))continue;
 if(line.includes('Freilos')){bye++;continue;}
 const parts=split(line.slice(15).replace(/\}\}\s*$/,''));const fields={};let home;
 for(const x of parts){const k=x.match(/^(\d+)=(.*)$/);if(k)fields[k[1]]=k[2];else if(home===undefined)home=x;}
 const a=clean(home||''),b=clean(fields[4]||''),raw=(fields[3]||'').replace(/<ref[\s\S]*/,'');const sc=raw.match(/(\d+):(\d+)/);if(!a||!b||!sc)throw Error('Historical row not parsed '+line);
 const score=sc.slice(1).map(Number),d=(fields[6]||'').match(/(\d{2})\.(\d{2})\.(\d{4})/);
 matches.push({id:'wiki-'+p.revid+'-'+matches.length,round,replay,date:d?d[3]+'-'+d[2]+'-'+d[1]:null,time:null,home:a,away:b,score,penalties:null,halfTime:null,regular:null,extraTime:/n\.&nbsp;V\./.test(raw)?true:null,status:'completed',winner:score[0]===score[1]?null:score[0]>score[1]?a:b,formalHome:null,homeTier:null,awayTier:null,venue:null});
 }
 const f=p.wikitext.split('== Finale ==')[1].split('\n==')[0];const field=k=>f.match(new RegExp('^\\| '+k+' = (.*)$','m'))?.[1];
 const home=clean(field('HEIM NAME')),away=clean(field('GAST NAME')),score=field('ERGEBNIS').match(/(\d+):(\d+)/).slice(1).map(Number);
 matches.push({id:'wiki-'+p.revid+'-final',round:'Finale',date:finalDate,time:null,home,away,score,penalties:null,halfTime:null,regular:null,extraTime:null,status:'completed',winner:score[0]>score[1]?home:away,formalHome:null,homeTier:null,awayTier:null,venue:null});
 seasons.push({season,source:'https://de.wikipedia.org/w/index.php?oldid='+p.revid,license:'CC-BY-SA-4.0',scope:season==='1935'?'Deutschlandweite Schlussrunden; regionale Qualifikation fehlt':'Hauptrunden laut Quelle',bye,matches});
}
const esc=s=>String(s??'Unbekannt').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const origin='https://pokalradar.pages.dev',base='/archiv-erweiterung/';
const page=(path,title,body)=>{mkdirSync('public'+path,{recursive:true});writeFileSync('public'+path+'index.html','<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+' | PokalRadar</title><meta name="description" content="'+esc(title)+' – Pokalbegegnungen mit Quellen und Datenabdeckung"><link rel="canonical" href="'+origin+path+'"><link rel="stylesheet" href="/style.css"></head><body><header><a href="/">PokalRadar</a> · <a href="'+base+'">Archiv-Erweiterung</a></header><main><h1>'+esc(title)+'</h1>'+body+'</main></body></html>');};
const total=seasons.reduce((n,s)=>n+s.matches.length,0);
page(base,'Erweitertes Pokalarchiv','<p>'+total+' zusätzliche Begegnungseinträge; getrennt von den bisherigen Ranglisten, noch nicht unabhängig vollständig verifiziert.</p><ul>'+seasons.map(s=>'<li><a href="'+base+s.season+'/">'+s.season+'</a> – '+s.matches.length+' Einträge</li>').join('')+'</ul>');
for(const s of seasons){
 const dir='public'+base+s.season+'/';mkdirSync(dir,{recursive:true});writeFileSync(dir+'matches.json',JSON.stringify(s,null,2)+'\n');
 page(base+s.season+'/','Pokal '+s.season,'<p>'+esc(s.scope||'Stand der abgerufenen Quelle')+' · '+s.matches.filter(m=>m.status==='completed').length+' Ergebnisse · '+s.matches.filter(m=>m.status==='scheduled').length+' offene Spiele.</p><p>Quelle: <a href="'+esc(s.source)+'">'+esc(s.license==='ODbL-1.0'?'OpenLigaDB':'Wikipedia, Versionsgeschichte und Autoren')+'</a> · <a href="'+(s.license==='ODbL-1.0'?'https://opendatacommons.org/licenses/odbl/1-0/':'https://creativecommons.org/licenses/by-sa/4.0/')+'">'+s.license+'</a> · <a href="matches.json">Normalisierte Daten herunterladen</a>. Bearbeitet: strukturierte Spielangaben; unbekannte Felder bleiben leer.</p><div class="tablewrap"><table><thead><tr><th>Runde</th><th>Datum</th><th>Erstgenannt</th><th>Zweitgenannt</th><th>Ergebnis</th></tr></thead><tbody>'+s.matches.map(m=>'<tr><td>'+esc(m.round)+(m.replay?' (Wiederholung)':'')+'</td><td>'+esc(m.date)+(m.time?' '+esc(m.time):'')+'</td><td>'+esc(m.home)+'</td><td>'+esc(m.away)+'</td><td>'+esc(m.score?m.score.join(':')+(m.penalties?' ('+m.penalties.join(':')+' i. E.)':''):'Offen')+'</td></tr>').join('')+'</tbody></table></div>');
}
console.log('Supplemental archive',seasons.map(s=>[s.season,s.matches.length]),'total',total);
