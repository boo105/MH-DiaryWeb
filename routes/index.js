const express = require('express');
const pool = require('../config/database');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
    let token = req.cookies.ac_token;       // 토큰 값 가져오기.
    let user_name = "undefined";            // 사용자 이름 가져오기.

    if(token) {
        jwt.verify(token, config.secret, async function (err, decoded) {
            if (err) {     // 토큰 만료 또는 미접속 시 토큰을 Clear 하고 로그인 페이지로 이동.
                res.clearCookie('ac_token').redirect('/signin');
            } else {
                const connection = await pool.getConnection(async conn => conn);

                let user_id = decoded.id;

                try {
                    let select_query = "SELECT name FROM ?? where id = ?";
                    let select_table = ["user", user_id];

                    select_query = mysql.format(select_query, select_table);

                    let [users] = await connection.query(select_query);
                    user_name = users[0].name;
                    console.log(users[0].name);
                } catch (err) {
                    res.status(err.status_code || 500).json({
                        "Success": false,
                        "Message": err.message || 'unknown Error',
                        "code": err.status_code || 500
                    });
                } finally {
                    res.render('index', {pass: true, user: user_name});
                    connection.release();       // 연결을 해제.
                }
            }
        });
    }
    else {
        const today = new Date();

        res.render('index', {pass: false, month: today.getMonth()+1, day: today.getDate()});
    }
});

module.exports = router;