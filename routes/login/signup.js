var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var md5 = require("MD5");
var pool = require('../../config/database');
var login = require('./login');
var idCheck = require('./idCheck');
var register = require('./register');

router.get('/', function(req, res, next) {
    res.render('signup', {layout : false});
});

// 일반 회원가입
router.post('/',async function(req,res,next) {
    var id = req.body.id;

    // user table 분리에 따른 값 분리
    var account_info = {
        id : id,
        password : md5(req.body.pwd),
        name : req.body.name,
    };
    var info = {
        id : id,
        sex : req.body.sex,
        tel : req.body.tel,
        email : req.body.email
    };

    register(account_info,info,res);
});

// sns 가입
router.post('/sns',async function(req,res,next) {
    var account_info = {
        id : req.body.id,
        name : req.body.name
    };
    var info = {
        id : req.body.id,
        email : req.body.email
    };

    register(account_info,info,res);
});

// id 중복 유무 체크해주는 컨트롤러
router.post('/idCheck',async function(req,res,next) {
    var id = req.body.id;

    let check = await idCheck(id);
    if(check)
        res.send(true);
    else
        res.send(false);
});

module.exports = router;
