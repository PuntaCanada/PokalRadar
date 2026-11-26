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
