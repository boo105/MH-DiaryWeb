var express = require('express');
var router = express.Router();
var request = require('request');
var naver_config = require('../../config/naver.json');
let idCheck = require('./idCheck');
let register = require('./register');
let login = require('./login');

// 네이버 콜백 주소로 접근하면 naver 계정 인증후 사이트 회원가입 및 로그인
router.get('/', function(req, res, next) {
    let code = req.query.code;
    let state = req.query.state;

    api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=' + naver_config.client_id + '&client_secret=' + naver_config.client_secret + '&redirect_uri=' + naver_config.redirectURI + '&code=' + code + '&state=' + state;
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':naver_config.client_id, 'X-Naver-Client-Secret': naver_config.client_secret}
    };

    // 네이버 access_token 값을 얻기 위한 api 접근
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200)
        {
            body = JSON.parse(body);
            console.log(body);
            var header = "Bearer " + body.access_token; // Bearer 다음에 공백 추가
            api_url = 'https://openapi.naver.com/v1/nid/me';
            var options = {
                url: api_url,
                headers: {'Authorization': header}
            };
            // 프로필 정보 조회 api (토큰 값으로 인증이 필요)
            request.get(options, async function (error, response, body) {
                if (!error && response.statusCode == 200)
                {
                    body = JSON.parse(body);
                    console.log(body);
                    let id = body.response.id;
                    let email = body.response.email;
                    let name = body.response.name;

                    let status = await idCheck(id);

                    // 회원가입
                    if(status === true)
                    {
                        var account_info = {
                            id : id,
                            name : name
                        };
                        var info = {
                            id : id,
                            email : email
                        };
                        register(account_info,info,res);
                    }
                    else if(status === false)    // 로그인
                    {
                        login(body.response.id,res);
                    }
                    else    // 에러
                    {
                        res.status(status.status_code || 500).json({"Success": false, "Message": status.message || 'unknown Error', "code": status.status_code || 500});
                    }
                } else
                {
                    console.log('error');
                    if(response != null)
                    {
                        res.status(response.statusCode).end();
                        console.log('error = ' + response.statusCode);
                    }
                }
            });
        }
        else
        {
            res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
        }
    });
});

module.exports = router;
