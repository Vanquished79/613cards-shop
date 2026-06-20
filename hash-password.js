const bcrypt = require('bcryptjs');
const password = process.argv[2];
if (!password) { console.error('Usage: node hash-password.js <your-password>'); process.exit(1); }
const hash = bcrypt.hashSync(password, 12);
console.log('\nYour password hash (copy this into ADMIN_PASSWORD_HASH on Vercel):\n');
console.log(hash);
console.log('');
