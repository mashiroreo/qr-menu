const fs = require('fs');

if (process.argv.length < 3) {
  console.log('Usage: node convert_csv_dates.js <input.csv>');
  process.exit(1);
}

const input = process.argv[2];
const output = input.replace(/\.csv$/, '_converted.csv');

const lines = fs.readFileSync(input, 'utf-8').split('\n').filter(Boolean);
const header = lines[0].split(',');
const createdAtIdx = header.indexOf('createdAt');
const updatedAtIdx = header.indexOf('updatedAt');

const converted = [header.join(',')];
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',');
  if (cols.length !== header.length) continue;
  if (createdAtIdx !== -1) cols[createdAtIdx] = new Date(Number(cols[createdAtIdx])).toISOString();
  if (updatedAtIdx !== -1) cols[updatedAtIdx] = new Date(Number(cols[updatedAtIdx])).toISOString();
  converted.push(cols.join(','));
}

fs.writeFileSync(output, converted.join('\n'));
console.log('変換完了:', output); 