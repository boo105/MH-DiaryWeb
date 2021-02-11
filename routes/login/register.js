let mysql = require('mysql2');
var pool = require('../../config/database');
var login = require('./login');

let register = async function (account_info,info,res)
{
    console.log(account_info);
    console.log(info);
    const connection = await pool.getConnection(async conn => conn);
    // 익명함수 conn 을 쓰지도 않아서 동기형식임
    // 콜백으로 에러처리랑 다해주기
    try
    {
        // Id 존재 유무는 어차피 jquery로 확인하기때문에 바로 insert해주면 됨
        const insert_query = "INSERT INTO ?? SET ?;";
        const account_table = ["user",account_info];
        const info_table = ["user_info",info];

        var account_insert_query = mysql.format(insert_query,account_table);
        var info_query = mysql.format(insert_query,info_table);

        await connection.query(account_insert_query);
        await connection.query(info_query);

        console.log("회원가입 완료!");
        // 회원가입 처리를 다하면 로그인 기능 실행
        login(account_info.id,res);
    }
    catch (err)
    {
        // 에러 로그 기록 해줘야함
        // 웹페이지 상에서 에러가 날시 표현을 어떻게 해줘야할지???
        res.status(err.status_code || 500).json({"Success" : false, "Message" : err.message || 'unknown Error', "code" : err.status_code || 500});
    }
    finally
    {
        connection.release();
    }
}

module.exports = register;