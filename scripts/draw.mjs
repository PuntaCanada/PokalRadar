// Marginal probabilities under uniform random draws, not historical observations.
export function drawOdds(teams,id,mode){
 if(!['one','two'].includes(mode)||teams.length<2||teams.length%2||new Set(teams.map(t=>t.id)).size!==teams.length)throw Error('Invalid field');
 if(teams.some(t=>mode==='one'?typeof t.amateur!=='boolean':!['A','P'].includes(t.pot)))throw Error('Missing draw status');
 const me=teams.find(t=>t.id===id);if(!me)throw Error('Unknown team');
 const same=teams.filter(t=>t.id!==id&&t.pot===me.pot),other=teams.filter(t=>t.pot!==me.pot);
 const n=same.length+1,k=other.length;
 const cross=Math.min(1,k/n);
 const out=teams.filter(t=>t.id!==id).map(t=>{
 let p,home;
 if(mode==='one'){p=1/(teams.length-1);home=me.amateur===t.amateur?.5:me.amateur?1:0;}
 else if(t.pot!==me.pot){p=k?cross/k:0;home=me.pot==='A'?1:0;}
 else{p=same.length?(1-cross)/same.length:0;home=.5;}
 return {id:t.id,p,homeGivenOpponent:home};
 }).filter(t=>t.p>0);
 return {opponents:out,homeProbability:out.reduce((s,t)=>s+t.p*t.homeGivenOpponent,0)};
}
