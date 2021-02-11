var express = require('express');
var router = express.Router();
var md5 = require("MD5");
var mysql = require('mysql2');
var pool = require('../config/database');

router.post('/',async function(req,res,next) {
    var che = md5(req.body.che);
    var id = req.body.id;

    const connection = await pool.getConnection(async conn => conn);
    try
    {
        var select_query = "SELECT * FROM ?? where id = ? and password = ?";
        let select_table = ["user",id,che];

        select_query = mysql.format(select_query,select_table);
        console.log(select_query);

        let [users] = await connection.query(select_query);
        if(users.length === 0)
        {   //비밀번호 비동일
            console.log("false");
            res.json({che: false});
        }
        else
        {   //비밀번호 동일
            console.log("true");
            res.json({che: true});
        }

    }
    catch (err)
    {
        // 에러 로그 기록 해줘야함
        res.status(err.status_code || 500).json({"Success": false, "Message": err.message || 'unknown Error', "code": err.status_code || 500});
    }
    finally
    {
        connection.release();
    }
});
module.exports = router;
