const fs = require('fs');
let code = fs.readFileSync('src/lib/team-portraits.json', 'utf8');
code = code.replace(
  '"website": "https://www.kaggle.com/mohit78241"',
  '"website": "https://www.kaggle.com/mohit78241",\n        "leetcode": "https://leetcode.com/mohit78247"'
);
fs.writeFileSync('src/lib/team-portraits.json', code);
console.log('Updated team-portraits.json');
