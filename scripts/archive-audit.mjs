import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {splitMatch} from './parser.mjs';

export function auditCup(text) {
  const rounds = [];
  let round;
  for (const line of text.split(/\r?\n/)) {
    const l = line.trim();
    if (!l || /^[=#]/.test(l)) continue;
    if (l.startsWith('▪')) {
      round = {name:l.slice(1).trim(), scored:0, scheduled:0, placeholders:0, unparsed:0};
      rounds.push(round); continue;
    }
    if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s/.test(l)) continue;
    if (!round) throw Error('Missing round context: '+l);
    if (/\bN\.N\./.test(l)) round.placeholders++;
    else if (splitMatch(l)) round.scored++;
    else if (/\s+v\s+/.test(l)) round.scheduled++;
    else round.unparsed++;
  }
  const expected = [32,16,8,4,2,1];
  const counts = Object.fromEntries(['scored','scheduled','placeholders','unparsed'].map(k=>[k,rounds.reduce((n,r)=>n+r[k],0)]));
  return {rounds,...counts,modernShapeComplete:rounds.length===6&&rounds.every((r,i)=>r.scored===expected[i]&&!r.scheduled&&!r.placeholders&&!r.unparsed)};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  if(!process.argv[2]) throw Error('Usage: node scripts/archive-audit.mjs SOURCE');
  const report=auditCup(readFileSync(process.argv[2],'utf8'));
  console.log(JSON.stringify(report,null,2));
  if(!report.modernShapeComplete) process.exitCode=1;
}
