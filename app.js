var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var path = require('path');
var express = require('express');
const expressLayout = require('express-ejs-layouts');
const bodyParser = require('body-parser');
var index = require('./routes/index');
var myDiary = require('./routes/myDiary');
var post = require('./routes/post');
var signin = require('./routes/login/signin');
var gallery = require('./routes/gallery');
var signup = require('./routes/login/signup');
var signout = require('./routes/signout');
var naver = require('./routes/login/naver');
var community = require('./routes/community');
var mypage = require('./routes/mypage');
var passCheck = require('./routes/passCheck');
var signout1 = require('./routes/signout1');
var loading = require('./routes/loading');
var verify = require('./middleware/verify');
var app = express();

// views 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layout');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.js 파일 경로로 워크 스페이스 전역설정
app.use(express.static(path.join(__dirname, '')));

// 레이아웃(헤더,푸터 등) 적용을 위한 설정
app.use(expressLayout);

// 어떤 페이지든 로그인 상태 검사를 함
app.use(function (req, res, next) {
    // 로그인 했는지 판별을 위해 token값이 있는지 확인
    var token = req.cookies.ac_token;
    let isLogin = false;
    if(token)
    {
        isLogin=true;
    }
    res.locals.isLogin = isLogin;
    next();
});

// 라우터 설정
app.use('/',loading);
app.use('/index', index);
app.use('/signin',signin);
app.use('/signup',signup);
app.use('/signout',signout);
app.use('/signin/naver/callback',naver);
app.use('/community',community);
app.use('/passCheck',passCheck);
app.use('/signout1',signout1);

// 미들웨어 패턴을 위한 설정
var apiRoutes = express.Router();
apiRoutes.use(bodyParser.urlencoded({extended: true}));
apiRoutes.use(bodyParser.json());
apiRoutes.use(verify);
apiRoutes.use('/myDiary',myDiary);
apiRoutes.use('/gallery',gallery);
apiRoutes.use('/post',post);
apiRoutes.use('/mypage',mypage);
apiRoutes.use('/gallery',gallery);

app.use('/user',apiRoutes);
app.use(bodyParser());

// 지정된 path 가 아니면 404 에러 페이지 던짐
app.use(function (req, res, next) {
    next(createError(404));
});

// 에러 핸들러
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // 에러페이지 렌더
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
