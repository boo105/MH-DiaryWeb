let mysql = require('mysql2');
var pool = require('../../config/database');

// 아이디 중복검사
var idCheck = async function (id){
    const connection = await pool.getConnection(async conn => conn);
    try
    {
        // Id 존재 유무는 어차피 jquery로 확인하기때문에 바로 insert해주면 됨
        var select_query = "SELECT id FROM ?? where id = ?;";
        const check_table = ["user", id];

        select_query = mysql.format(select_query, check_table);

        var [rows] = await connection.query(select_query);
        console.log(rows.length);

        // 회원가입 정보가 없음
        if (rows.length === 0)
            return true;
        else
            return false;
    }
    catch (err)
    {
        return err;
    }
    finally
    {
        connection.release();
    }
};

module.exports = idCheck;