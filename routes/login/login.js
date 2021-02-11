var jwt = require('jsonwebtoken');
var config = require('../../config/config');
var pool = require('../../config/database');

// 실제 로그인 기능
var login = async function (id,res) {
    const connection = await pool.getConnection(async conn => conn);
    try
    {
        // refresh_token 값 검색
        var refresh_query = "SELECT * FROM user_token WHERE id = ?"
        var [refresh] = await connection.query(refresh_query, id);

        let check_exp = false;
        // 최초 로그인시
        if (refresh.length === 0)
        {
            // refresh_token 등록
            var refresh_token = jwt.sign({id: id}, config.secret, {expiresIn: '14d'});
            var data = {
                id: id,
                refresh_token: refresh_token
            };
            var refresh_insert_query = "INSERT INTO user_token SET ?";
            await connection.query(refresh_insert_query, data);
        }
        else    // 리프레쉬 검증후 엑세스 발급
        {
            jwt.verify(refresh[0].refresh_token, config.secret, async function (err, decoded) {
                if (err)     // refresh 도 만료시 유령회원임을 알려줌
                    check_exp = true;
                else
                {
                    let exp = new Date( decoded.exp * 1000 );
                    let gap = exp.getTime() - new Date().getTime();
                    let gap_day = gap / 1000 / 60 / 60 / 24;
                    console.log("refresh_token 남은 시간 : " + gap_day);
                    // 만료기간까지 7일 이하면 재발급 해줌
                    if(gap_day <= 7)
                    {
                        console.log("refresh_token 재발급");
                        var refresh_token = jwt.sign({id: id}, config.secret, {expiresIn: '14d'});
                        let update_query = "UPDATE user_token SET refresh_token = ? where id = ?;";
                        await connection.query(update_query,[refresh_token,id]);
                    }
                }
            });
            if(check_exp)
            {
                console.log("만료됬어요!");
                return "exp";
            }
        }
        // access_token 발급 및 쿠키 설정
        var access_token = jwt.sign({id: id}, config.secret, {expiresIn: '2h'});
        res.cookie('ac_token', access_token);
        res.redirect('/index');
    }
    catch (err)
    {
        res.status(err.status_code || 500).json({"Success" : false, "Message" : err.message || 'unknown Error', "code" : err.status_code || 500});
    }
    finally
    {
        connection.release();
    }
};

module.exports = login;
