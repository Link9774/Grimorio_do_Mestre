const mysql = require('mysql2/promise');

const conexao = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'P3rS0n4_5',
    database: 'grimorio_mestre',
    port: 3306
});
module.exports = conexao;