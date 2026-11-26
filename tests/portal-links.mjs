import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const xml=readFileSync('public/sitemap.xml','utf8');
const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
assert.equal(new Set(urls).size,urls.length);
assert.ok(urls.length>100);
let count=0;
for(const path of urls){
 const file='public'+path+'index.html';
 assert.ok(existsSync(file),file);
 const html=readFileSync(file,'utf8');
 assert.ok(html.includes('rel="canonical" href="https://pokalradar.pages.dev'+path+'"'),file);
 for(const m of html.matchAll(/href="(\/[^"#?]*)"/g)){
  const target='public'+m[1]+(m[1].endsWith('/')?'index.html':'');
  assert.ok(existsSync(target),file+' -> '+target);count++;
 }
}
console.log('Sitemap entries',urls.length,'club profiles',urls.filter(p=>/^\/vereine\/[^/]+\/$/.test(p)).length,'season pages',urls.filter(p=>/^\/saison\/[^/]+\/$/.test(p)).length,'internal links',count);
