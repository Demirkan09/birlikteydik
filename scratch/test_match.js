const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'sablonlar', 'sablon-amber', 'page.tsx'), 'utf8');
const targetStr = "new Audio(config.musicUrl)";
const targetIdx = content.indexOf(targetStr);
console.log('targetIdx:', targetIdx);

if (targetIdx !== -1) {
  const remaining = content.substring(targetIdx);
  const match = remaining.match(/\}\s*,\s*\[[^\]]*?\]\s*\);?/);
  console.log('match found:', !!match);
  if (match) {
    console.log('match index:', match.index);
    console.log('matched text:', match[0]);
  }
}
