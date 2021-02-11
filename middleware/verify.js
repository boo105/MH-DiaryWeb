var jwt = require('jsonwebtoken');
var config = require('../config/config');
var pool = require('../config/database');

// 로그인 상태 검증
var verifyLogin=async function (req, res, next) {
    let like = req.body.like;
    var token = req.cookies.ac_token;

    // 로그인을 했을 경우
    if (token)
    {
        // access_token 검증
        jwt.verify(token, config.secret, async function (err,decoded) {
            if(err) // 토큰 만료
            {
                // 만료시 401 상태코드 설정 및 로그인 화면으로 돌아감
                res.clearCookie('ac_token').redirect('/signin');
            }
            else
            {
                req.user = decoded;
                if(like != undefined)
                    res.send(req.user.id);
                else    // 정상 수행
                    next();     // 다음 기능 수행
            }
        });
    }
    else
    {
        // likepage에서 보낸 검증인경우는 boolean 형태로 보냄
        if(like != undefined)
            res.send(false);
        else
        {
            // res write 로 작성을 한뒤 url 변경
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write("<script language='javascript'>alert('로그인을 해주세요!')</script>");
            res.write("<script language=\'javascript\'>window.location='/index'</script>");
        }
    }
};

module.exports=verifyLogin;