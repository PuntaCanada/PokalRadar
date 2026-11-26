import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const origin='https://pokalradar.pages.dev';
const sitemap=readFileSync('public/sitemap.xml','utf8');
const routes=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
const targets=['/','/vereine/','/statistiken/','/saison/','/saison/2024-25/',routes.find(p=>/^\/vereine\/[^/]+\/$/.test(p)),'/sitemap.xml','/data/seasons.json'];
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const route of targets){try{const response=await fetch(origin+route,{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});if(!response.ok)throw Error('HTTP '+response.status);const actual=Buffer.from(await response.arrayBuffer()),expected=readFileSync('public'+route+(route.endsWith('/')?'index.html':''));console.log('PRODUCTION',route,actual.equals(expected)?'MATCH':'MISMATCH',hash(actual),hash(expected));}catch(e){console.log('PRODUCTION',route,'UNVERIFIED',e.message)}}
