var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var pool = require('../config/database');

router.get('/', function(req, res, next) {

});

router.post('/', async function(req, res,next) {
    id = req.body.id;

    const connection = await pool.getConnection(async conn => conn);
    try {
        const delete_query = "DELETE FROM ?? WHERE id = ?";
        const account_table_user = ["user", id];
        const account_table_user_info = ["user_info", id];

        // user 테이블 속 데이터 삭제
        delete_account_query_user = mysql.format(delete_query,account_table_user);
        await connection.query(delete_account_query_user);
        // user_info 테이블 속 데이터 삭제
        delete_account_query_user_info = mysql.format(delete_query,account_table_user_info);
        await connection.query(delete_account_query_user_info);

        // 토큰 쿠키 삭제 및 리다이렉트
        res.clearCookie('ac_token').redirect('index');
    }
    catch (err)
    {
        // 에러 로그 기록 해줘야함
        res.status(err.status_code || 500).json({"Success" : false, "Message" : err.message || 'unknown Error', "code" : err.status_code || 500});
    }
    finally {
        connection.release();
    }
});
module.exports = router;
