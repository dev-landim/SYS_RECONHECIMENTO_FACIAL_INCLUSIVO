// db.js
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',          
  database: 'sistema_faceid', // nome do seu DB
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
