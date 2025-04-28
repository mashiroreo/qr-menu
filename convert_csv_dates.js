const fs = require('fs');
const path = require('path');

const input = 'user.csv';
const output = 'user_converted.csv';

const lines = fs.readFileSync(input, 'utf-8').split('\n').filter(Boolean);
const header = lines[0].split(',');
const createdAtIdx = header.indexOf('createdAt');
const updatedAtIdx = header.indexOf('updatedAt');

const converted = [header.join(',')];
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',');
  if (cols.length !== header.length) continue;
  // UNIXミリ秒→ISO8601
  cols[createdAtIdx] = new Date(Number(cols[createdAtIdx])).toISOString();
  cols[updatedAtIdx] = new Date(Number(cols[updatedAtIdx])).toISOString();
  converted.push(cols.join(','));
}

fs.writeFileSync(output, converted.join('\n'));
console.log('変換完了:', output); 