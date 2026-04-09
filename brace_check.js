const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/Contest/Contest.js');
const text = fs.readFileSync(file, 'utf8');
let count = 0;
let line = 1;
for (let i = 0; i < text.length; i++) {
  const ch = text[i];
  if (ch === '\n') {
    line++;
  } else if (ch === '{') {
    count++;
  } else if (ch === '}') {
    count--;
    if (count < 0) {
      console.log('negative at line', line);
      break;
    }
  }
}
console.log('final count', count);
