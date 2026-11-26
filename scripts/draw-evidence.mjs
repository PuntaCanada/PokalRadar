import {drawOdds} from './draw.mjs';
export function evaluateDraw(evidence,seasons){
 const {season,round,matches}=evidence;
 if(season!=='2024-25'||round!==2||matches.length!==16)throw Error('Unsupported or incomplete round');
 const actual=seasons.find(s=>s.season===season)?.matches.filter(m=>m.round===round)||[];
 if(actual.length!==matches.length||new Set(matches.map(m=>m.matchId)).size!==16)throw Error('Incomplete match coverage');
 const teams=matches.flatMap(m=>[{id:m.home,pot:m.homePot,tier:m.homeTier},{id:m.away,pot:m.awayPot,tier:m.awayTier}]);
 if(new Set(teams.map(t=>t.id)).size!==32||teams.filter(t=>t.pot==='A').length!==3||teams.filter(t=>t.pot==='P').length!==29)throw Error('Wrong field');
 if(teams.some(t=>!Number.isInteger(t.tier)||t.tier<1||t.tier>4||t.pot!==(t.tier>2?'A':'P')))throw Error('Invalid pot evidence');
 const out=[];
 for(const m of matches){
 const a=actual.find(x=>x.id===m.matchId);
 if(!a||a.home!==m.home||a.away!==m.away||a.homeTier!==m.homeTier||a.awayTier!==m.awayTier||m.formalHome!==m.home||m.venue!==null||!m.ruleSource||!m.pairingSource||m.awayPot==='A')throw Error('Invalid evidence '+m.matchId);
 for(const [id,opp] of [[m.home,m.away],[m.away,m.home]]){
 const odds=drawOdds(teams,id,'two'),o=odds.opponents.find(t=>t.id===opp);
 if(!o)throw Error('Impossible pairing');
 const expectedTier=odds.opponents.reduce((sum,t)=>sum+t.p*teams.find(c=>c.id===t.id).tier,0);
 const actualTier=teams.find(c=>c.id===opp).tier;
 const home=Number(m.formalHome===id);
 out.push({id,opponent:opp,formalHome:home===1,venue:null,homeProbability:odds.homeProbability,homeDelta:home-odds.homeProbability,opponentProbability:o.p,expectedOpponentTier:expectedTier,actualOpponentTier:actualTier,opponentTierDelta:actualTier-expectedTier,matchId:m.matchId,ruleSource:m.ruleSource,pairingSource:m.pairingSource});
 }}
 return out;
}
