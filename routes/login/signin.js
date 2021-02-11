var express = require('express');
var router = express.Router();
var pool = require('../../config/database');
var md5 = require("MD5");
var mysql = require('mysql2');
var cookie = require('cookie-parser');
var login = require('./login');

/* GET home page. */
router.get('/', function(req, res, next) {
    let state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let api_url = "";
    var naver_config = require('../../config/naver.json');
    api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + naver_config.client_id + '&redirect_uri=' + naver_config.redirectURI + '&state=' + state;

    res.render('signin', {layout : false, api_url : api_url});
});

// 일반 로그인
router.post('/', async function(req, res, next) {
    let id = req.body.username;
    let pwd = md5(req.body.password);

    const connection = await pool.getConnection(async conn => conn);
    try
    {
        // 로그인 유효성 검사
        var select_query = "SELECT * FROM ?? user where id = ? and password = ?";
        let select_table = ["user",id,pwd];

        select_query = mysql.format(select_query,select_table);
        console.log(select_query);

        let [users] = await connection.query(select_query);
        // 로그인 실패한 경우
        if(users.length === 0)
        {
            res.send(false);
            //throw {message : "로그인 실패", status_code : 500};
        }
        else
        {
            console.log(users[0]);
            // 로그인
            res.send(await login(id,res));
        }
    }
    catch (err)
    {
        res.status(err.status_code || 500).json({"Success" : false, "Message" : err.message || 'unknown Error', "code" : err.status_code || 500});
    }
    finally
    {
        connection.release();
    }
});

// sns 로그인
router.post('/sns', async function(req, res, next) {
    let id = req.body.id;
    login(id,res);
});

module.exports = router;
