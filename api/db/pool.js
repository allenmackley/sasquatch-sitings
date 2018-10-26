const mysql = require('mysql');
//Creating a connection pool allows queries to run in parallel, significantly speeding up operation as an app grows in size.
module.exports = mysql.createPool({
    //docker-compose makes this local domain name available, which points to the IP for the mysqldb container
    host     : 'mysqldb',
    user     : 'test',
    password : 'test',
    database : 'test',
    port     : 3306,
    connectionTimeout: 10000,
    connectionLimit: 10,
});