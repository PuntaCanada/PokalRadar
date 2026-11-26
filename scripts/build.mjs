import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {parseCup,leagueTeams} from './parser.mjs';import {validate} from './validate.mjs';
import {canonicalName} from './identities.mjs';
const tierEvidence=JSON.parse(readFileSync('data/tier-evidence.json','utf8'));
if(tierEvidence.some(e=>!Number.isSafeInteger(e.tier)||e.tier<1||!e.source))throw Error('Invalid historical tier evidence');
const root='data/sources/openfootball';const seasons=[];
for(const season of readdirSync(root).sort()){const dir=root+'/'+season;const matches=parseCup(readFileSync(dir+'/cup.txt','utf8'),season);validate(matches);const tiers=new Map();
for(const file of readdirSync(dir).filter(f=>/^\d+-/.test(f))){for(const team of leagueTeams(readFileSync(dir+'/'+file,'utf8'))){const tier=Number(file.split('-')[0]);if(!Number.isSafeInteger(tier)||tier<1)throw Error('Invalid league tier file');const name=canonicalName(team);if(!tiers.has(name))tiers.set(name,new Set());tiers.get(name).add(tier);}}
for(const m of matches){for(const side of ['home','away']){const t=tiers.get(canonicalName(m[side]));const e=tierEvidence.find(x=>x.season===season&&canonicalName(x.club)===canonicalName(m[side]));if(e&&t?.size===1&&![...t].includes(e.tier))throw Error('Tier source conflict '+m[side]);m[side+'Tier']=t?.size===1?[...t][0]:e?.tier??null;if(e)m[side+'TierSource']=e.source;} }
const champion=matches.find(m=>m.round===6).winner;for(const m of matches){m.champion=champion;m.eliminatedByChampion=m.winner===champion;}
seasons.push({season,champion,coverage:'structural-validation-only',matches});}
mkdirSync('public/data',{recursive:true});writeFileSync('public/data/seasons.json',JSON.stringify(seasons));console.log('Imported',seasons.length,'seasons',seasons.reduce((n,s)=>n+s.matches.length,0),'records');

console.log('Tier coverage',seasons.flatMap(s=>s.matches).reduce((n,m)=>n+Number(m.homeTier!==null)+Number(m.awayTier!==null),0),'of 882');
