var express = require('express');
const mysql = require('mysql2');
const pool = require('../config/database');
var router = express.Router();
var getDate = require('./getDate');

/* GET home page. */
router.get('/', async function(req, res, next) {
    var user_id = req.user.id;

    var user_name = "";
    var post_no = 0;
    const connection = await pool.getConnection(async conn => conn);
    try {
        let select_query = "select * from ?? where author=? order by created asc";
        select_query = mysql.format(select_query, ["post", user_id]);

        let [no] = await connection.query(select_query);

        post_no = no.length;

        select_query = "select name from ?? where id=?";
        select_query = mysql.format(select_query, ["user", user_id]);

        [no] = await connection.query(select_query);
        user_name = no[0].name
    }
    catch {

    }
    finally {
        connection.release();
    }

    res.render('gallery', { user: user_name, postNo: post_no });
});

router.post('/', async function(req, res, next) {
    var user_id = req.user.id;
    var post_no = 0;

    const connection = await pool.getConnection(async conn => conn);
    try {
        let select_query = "select * from ?? where author=? order by created asc";
        select_query = mysql.format(select_query, ["post", user_id]);
        let [no] = await connection.query(select_query);

        for(let i=0; i<no.length; i++)
            getDate(no[i]);

        post_no = no.length;
        res.send(no);

        res.local.user = user_id;
        res.local.postNo = post_no;
    }
    catch {

    }
    finally {
        connection.release();
    }
});

module.exports = router;