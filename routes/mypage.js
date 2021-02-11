var express = require('express');
var router = express.Router();
var md5 = require("MD5");
var mysql = require('mysql2');
var pool = require('../config/database');


/* GET home page. */

router.get('/', async function(req, res, next) {
    var id = req.user.id;

    const connection = await pool.getConnection(  async conn => conn);

    try
    {
        // name 찾기
        var select_query_name = "SELECT name FROM ?? WHERE id = ?;";
        const account_table_name = ["user",id];

        select_query_name = mysql.format(select_query_name,account_table_name);

        var [temp1] = await connection.query(select_query_name);
        var name = temp1[0].name;

        // sex, email, tel 찾기
        const select_query_another = "SELECT sex,tel,email FROM ?? WHERE id = ?;";
        const account_table_another = ["user_info",id];

        var account_select_query_another = mysql.format(select_query_another,account_table_another);

        var [temp2] = await connection.query(account_select_query_another);
        var email = temp2[0].email;
        var tel = temp2[0].tel;
        var sex;
        // 성별 체크
        if(temp2[0].sex == 'M') {
            sex = "남자";
        }
        else if (temp2[0].sex == 'F')   sex = "여자";

        else    sex = null;

        // 카카오 로그인 전화번호 미표시
        if(temp2[0].tel === 0) {
            tel = null;
        }
        res.render('mypage',{layout:false, Id:id, Name:name, Sex: sex, Email:email, Tel:tel});
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


router.post('/',async function(req,res,next) {
    const connection = await pool.getConnection(async conn => conn);
    try
    {
        id = req.body.id;

        // 전화번호 업데이트
        const update_query_tel = "UPDATE ?? SET tel = ? WHERE id = ?";
        const account_table_tel = ["user_info", req.body.tel , id];

        update_account_query_tel = mysql.format(update_query_tel,account_table_tel);
        await connection.query(update_account_query_tel);

        // 비밀번호 업데이트
        if(!((req.body.pwd).length === 0)) {
            const update_query_pwd = "UPDATE ?? SET password = ? WHERE id = ?";
            const account_table_pwd = ["user", md5(req.body.pwd) , id];

            update_account_query_pwd = mysql.format(update_query_pwd,account_table_pwd);
            await connection.query(update_account_query_pwd);
        }
        // 끝나면 다른 페이지
        res.redirect('/user/myDiary');
    }
    catch (err)
    {
        // 에러 로그 기록 해줘야함
        // 웹페이지 상에서 에러가 날시 표현을 어떻게 해줘야할지???
        res.status(err.status_code || 500).json({"Success" : false, "Message" : err.message || 'unknown Error', "code" : err.status_code || 500});
    }
    finally {
        connection.release();
    }
});
module.exports = router;
