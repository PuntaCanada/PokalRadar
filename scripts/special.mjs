import {canonicalName} from './identities.mjs';
export function specialStats(seasons){
 const clubs=new Map(),upsets=[];let known=0,total=0;
 const get=n=>{n=canonicalName(n);if(!clubs.has(n))clubs.set(n,{name:n,played:0,wins:0,penPlayed:0,penWins:0,knownTier:0,upsets:0,streak:0,longest:0,history:[]});return clubs.get(n)};
 const matches=seasons.flatMap(s=>s.matches).sort((a,b)=>a.season.localeCompare(b.season)||a.round-b.round||a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 for(const m of matches){
 const h=get(m.home),a=get(m.away),winner=canonicalName(m.winner),w=winner===h.name?h:a,l=w===h?a:h,wt=w===h?m.homeTier:m.awayTier,lt=w===h?m.awayTier:m.homeTier;
 const eligible=Number.isInteger(wt)&&Number.isInteger(lt)&&m.result.status==='completed';total++;if(eligible){known++;if(wt>lt){w.upsets++;upsets.push({season:m.season,round:m.round,date:m.date,winner:w.name,loser:l.name,winnerTier:wt,loserTier:lt,gap:wt-lt,raw:m.raw});}}
 for(const [c,o] of [[h,a],[a,h]]){const won=c===w;c.played++;c.wins+=Number(won);c.knownTier+=Number(eligible);c.streak=won?c.streak+1:0;c.longest=Math.max(c.longest,c.streak);if(m.result.penalties&&m.result.status==='completed'){c.penPlayed++;c.penWins+=Number(won);}c.history.push({opponent:o.name,season:m.season,won});}
 }
 return {clubs:[...clubs.values()].sort((a,b)=>a.name.localeCompare(b.name,'de')),upsets:upsets.sort((a,b)=>b.gap-a.gap||a.date.localeCompare(b.date)),coverage:{known,total}};
}

export function archiveSpecialInput(archive){
 const normalize=(n,season)=>{const m=String(n??'').match(/^(.*?)\s+\(([IVX]+)\)$/);const tiers={I:1,II:2,III:3,IV:4,V:5,VI:6,VII:7,VIII:8,IX:9,X:10};return m&&season>='2008-09'&&season<='2017-18'&&tiers[m[2]]?{name:m[1],tier:tiers[m[2]]}:{name:n,tier:null};};
 return archive.map(s=>({season:s.season,matches:s.matches.map(m=>{const h=normalize(m.home,s.season),a=normalize(m.away,s.season);return {...m,season:s.season,home:h.name,away:a.name,winner:normalize(m.winner,s.season).name,homeTier:m.homeTier??h.tier,awayTier:m.awayTier??a.tier,result:{status:m.status,playedScore:m.score,penalties:m.penalties},raw:m.score?m.score.join(' : '):'Unbekannt'};})}));
}
export function historicalSpecial(seasons){
 const clubs=new Map(),upsets=[];let known=0,total=0;
 const get=n=>{n=canonicalName(n);if(!clubs.has(n))clubs.set(n,{name:n,played:0,wins:0,penPlayed:0,penWins:0,knownTier:0,upsets:0,streak:0,longest:0,history:[]});return clubs.get(n)};
 const matches=seasons.flatMap(s=>s.matches.map(m=>({...m,season:s.season}))).sort((a,b)=>a.season.localeCompare(b.season)||String(a.date??'').localeCompare(String(b.date??''))||a.id.localeCompare(b.id));
 for(const m of matches){const h=get(m.home),a=get(m.away),winner=canonicalName(m.winner),w=winner===h.name?h:winner===a.name?a:null;const played=m.result.status==='completed'&&Array.isArray(m.result.playedScore),eligible=played&&Number.isInteger(m.homeTier)&&Number.isInteger(m.awayTier)&&m.homeTier>0&&m.awayTier>0; if(played)total++;if(eligible){known++;if(w&&h!==a){const l=w===h?a:h,wt=w===h?m.homeTier:m.awayTier,lt=w===h?m.awayTier:m.homeTier;if(wt>lt){w.upsets++;upsets.push({season:m.season,round:m.round,date:m.date,winner:w.name,loser:l.name,gap:wt-lt,raw:m.raw});}}}
 for(const [c,o] of [[h,a],[a,h]]){const won=c===w&&h!==a;c.played+=Number(played);c.wins+=Number(won);c.knownTier+=Number(eligible);c.streak=played&&won&&m.date?c.streak+1:0;c.longest=Math.max(c.longest,c.streak);if(played&&m.result.penalties){c.penPlayed++;c.penWins+=Number(won);}if(played)c.history.push({opponent:o.name,season:m.season,won});}}
 return {clubs:[...clubs.values()],upsets:upsets.sort((a,b)=>b.gap-a.gap||String(a.date??'').localeCompare(String(b.date??''))),coverage:{known,total}};
}
