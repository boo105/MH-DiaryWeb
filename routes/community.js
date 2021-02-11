var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var pool = require('../config/database');
var getDate = require('./getDate');

/* GET home page. */
router.get('/', function(req, res, next) {
    let sort = req.query.sort === undefined ? 0 : req.query.sort;
    // 정렬방법을 넘겨줌
    res.render('community',{sort : sort});
});

// like 체크
router.get('/likeCheck',async function (req,res,next){
    let id = req.query.id;
    let bo_no = req.query.bo_no;    // 글번호

    const connection = await pool.getConnection(async conn => conn);
    try
    {
        // 게시물 정보 불러오기
        let like_check_query = "SELECT * FROM like_info where user_id = ? and post_no = ?";
        let query_table = [id,bo_no];
        like_check_query = mysql.format(like_check_query,query_table);
        let [check] = await connection.query(like_check_query);
        console.log(check);

        // like를 안한경우
        if(check.length === 0)
            res.send(false);
        else
            res.send(true);
    }
    catch(err)
    {
        res.status(err.status_code || 500).json({"Success" : false, "Message" : err.message || 'unknown Error', "code" : err.status_code || 500});
    }
    finally
    {
        connection.release();
    }

});

// 상세페이지
router.get('/:no', async function(req, res, next) {
    let no = req.params.no;

    const connection = await pool.getConnection(async conn => conn);
    try
    {
        // 게시물 정보 불러오기
        let get_post_query = "SELECT title,content,happiness,image,weather,author,like_count,created FROM post where no = ?;";
        let [post] = await connection.query(get_post_query,no);
        // 시간 변환
        getDate(post[0]);
        console.log(post);
        // 상세페이지 표시
        res.render('detail',{post : post[0],bo_no : no});
    }
    catch(err)
    {
        res.status(err.status_code || 500).json({"Success" : false, "Message" : err.message || 'unknown Error', "code" : err.status_code || 500});
    }
    finally
    {
        connection.release();
    }
});


// community 게시판에 불러오기
router.post('/', async function(req, res, next) {
    let page = req.body.page - 1;
    let sort = req.body.sort;

    const connection = await pool.getConnection(async conn => conn);
    try
    {
        // 페이지당 10개 정도
        let get_post_query = "";
        // sort 0이면 최신순  1이면 좋아요순
        if(sort === '0')
            get_post_query = "SELECT no,title,image,author,created FROM post where public = 1 order by created DESC LIMIT ?,?;";
        else
            get_post_query = "SELECT no,title,image,author,created FROM post where public = 1 order by like_count DESC LIMIT ?,?;";
        let query_table = [12*page,12];
        get_post_query = mysql.format(get_post_query,query_table);
        let [posts] = await connection.query(get_post_query);
        // 시간 변환
        for(let i=0; i<posts.length; i++)
            getDate(posts[i]);
        res.json(posts);
    }
    catch(err)
    {
        res.status(err.status_code || 500).json({"Success" : false, "Message" : err.message || 'unknown Error', "code" : err.status_code || 500});
    }
    finally
    {
        connection.release();
    }
});

// 좋아요 기능 작동
router.post('/like',async function (req,res){
    let data = {
        post_no : req.body.bo_no,
        user_id : req.body.id
    };

    const connection = await pool.getConnection(async conn => conn);
    try
    {
        // like 카운트 및 반영
        let update_query = "UPDATE post SET like_count = like_count + 1 where no = ?;";
        await connection.query(update_query,data.post_no);


        // like 기록 추가
        let insert_query = "INSERT INTO like_info SET ?";
        await connection.query(insert_query,data);

        res.send();
    }
    catch(err)
    {
        res.status(err.status_code || 500).json({"Success" : false, "Message" : err.message || 'unknown Error', "code" : err.status_code || 500});
    }
    finally
    {
        connection.release();
    }
});

// 좋아요 취소 기능
router.post('/unlike',async function (req,res){
    let post_no = req.body.bo_no;
    let user_id = req.body.id;

    const connection = await pool.getConnection(async conn => conn);
    try
    {
        // like 카운트 및 반영
        let update_query = "UPDATE post SET like_count = like_count - 1 where no = ?;";
        await connection.query(update_query,post_no);

        // like 기록 삭제
        let insert_query = "DELETE from like_info where post_no = ? and user_id = ?";
        let insert_table = [post_no,user_id];
        insert_query = mysql.format(insert_query,insert_table);
        await connection.query(insert_query);

        res.send();
    }
    catch(err)
    {
        res.status(err.status_code || 500).json({"Success" : false, "Message" : err.message || 'unknown Error', "code" : err.status_code || 500});
    }
    finally
    {
        connection.release();
    }
});

module.exports = router;
