const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const pool = require('../config/database');
const fs = require('fs');
const multer = require('multer');

let upload = multer({dest:'gallery/'});

router.get('/', async function(req, res, next) {

    // 폴더 생성 위한 경로 설정
    let repath = 'gallery/' + req.user.id;
    // 이미지 저장 폴더 생성
    if (!fs.existsSync(repath)) {
        const makefolder = (repath) => {
            fs.mkdirSync(repath)
        }
        makefolder(repath);
    }

    const connection = await pool.getConnection(async conn => conn);
    try {

        // 일당 글 작성 갯수 제한
        const select_query_date = "SELECT * FROM ?? WHERE author = ?";
        const account_table_date = ["post", req.user.id];

        select_account_query_date = mysql.format(select_query_date, account_table_date);

        var [check] =  await connection.query(select_account_query_date);
        var i = check.length;

        if(!(i === 0)) {
                // 글 작성 날짜 추출
            var number;

            var dd = (check[i-1].created).getDate();
            var mm = (check[i-1].created).getMonth() + 1;
            var yy = (check[i-1].created).getFullYear();

            // 현재 날짜와 비교
            var today = new Date();

            var dd_t = today.getDate();
            var mm_t = today.getMonth() + 1;
            var yy_t = today.getFullYear();


            if((dd == dd_t) && (mm == mm_t) && (yy == yy_t)) {
                var end = '0';
                res.render('post',{postID: req.user.id, end: end});
            }
            else {
                var end = '1';
                res.render('post', {postID: req.user.id, end: end});
            }
        }
        else {
            var end = '1';
            res.render('post', {postID: req.user.id, end: end});
        }
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

router.post('/' ,upload.single('image'), async function(req,res,next) {
    const connection = await pool.getConnection(async conn => conn);
    try
    {
        var content_in = {};
        
        if(req.file == null){
            content_in = {
                title: req.body.title,
                content: req.body.content,
                happiness: req.body.happiness,
                image: null,
                weather: req.body.weather,
                public: req.body.public,
                author: req.body.author,
                like_count: '0',
            }
        }
        else {
            content_in = {
                title: req.body.title,
                content: req.body.content,
                happiness: req.body.happiness,
                image: req.file.path,
                weather: req.body.weather,
                public: req.body.public,
                author: req.body.author,
                like_count: '0',
            }
        }
        const insert_query = "INSERT INTO ?? SET ?";
        const account_table = ["post", content_in];

        insert_account_query = mysql.format(insert_query,account_table);
        let [no] = await connection.query(insert_account_query);

        // 이미지 파일 경로 및 이름 변경
        if(!(req.file == null)) {
            var newpath = 'gallery/' + req.body.author + '/' + no.insertId + '.' + req.file.mimetype.split('/')[1];
            await fs.rename(req.file.path, newpath, function (err) {
                if (err) throw err;
                console.log('renamed complete');
            });
        }
        // DB 이미지 칼럼 주소 업데이트
        const insert_query_no = "UPDATE ?? SET image = ? WHERE no = ?";
        const account_table_no = ["post", newpath, no.insertId];

        insert_account_query_no = mysql.format(insert_query_no,account_table_no);
        await connection.query(insert_account_query_no);

        // 끝나면 다른 페이지
        if(req.body.public == 1) {
            res.redirect('/community');
        }
        else res.redirect('/user/myDiary');
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
