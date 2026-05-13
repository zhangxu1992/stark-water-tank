const fs = require('fs');
const crypto = require('crypto');
const jwt = crypto.randomBytes(32).toString('hex');
let c = fs.readFileSync('/www/wwwroot/stktank.cosens.cn/server/.env', 'utf8');
c = c.replace(/JWT_SECRET=.*/, 'JWT_SECRET=' + jwt);
c = c.replace(/CLIENT_URL=.*/, 'CLIENT_URL=https://stktank.cosens.cn');
fs.writeFileSync('/www/wwwroot/stktank.cosens.cn/server/.env', c);
console.log('JWT_SECRET set: ' + jwt.substring(0, 8) + '...');
console.log('CLIENT_URL set');
