var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    // 토큰 쿠키 삭제 및 리다이렉트
    res.clearCookie('ac_token').redirect('/index');
});

module.exports = router;