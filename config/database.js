var mysql = require('mysql2/promise');
//var logger = require('./config/winston');

const db = {
    host     : 'server.djai.kr',
    port     : '3306',
    user     : 'ai',
    password : 'aS123123!',
    database : 'mh',
    dataString: 'date'
};

var pool = mysql.createPool(db);

// DB 끊기면 다시 연결해줌
function handleDisconnect() {

    // 커넥션을 가져왔을때(연결하려고했을때) error가 뜬다면 2초뒤 다시 접속
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log('error when connecting to db:', err);
            //logger.error('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
        connection.release();
    });

    // error 이벤트랑 함수 연결
    pool.on('error', function (err, connection) {
        //logger.error('db error', err);
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
        connection.release();
    });
}

handleDisconnect();


module.exports = pool;