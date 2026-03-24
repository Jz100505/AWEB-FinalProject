require('dotenv').config();
const { handler } = require('./netlify/functions/register.js');
handler({
  httpMethod: 'POST',
  body: JSON.stringify({ name: 'Test Server', email: 'testserver@example.com', password: 'password123' })
}).then(console.log).catch(console.error);
