const express = require('express');
const pool = require('../config/database');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const router = express.Router();

router.get('/', async function(req, res) {

  let token = req.cookies.ac_token;         // 토큰 값 가져오기.
  let user_name = 'undefined';              // 사용자 이름 가져오기.

  if (token) {
    jwt.verify(token, config.secret, async function (err, decoded) {

      if(err) {     // 토큰 만료 또는 미접속 시 토큰을 Clear 하고 로그인 페이지로 이동.
        res.clearCookie('ac_token').redirect('/signin');
      }
      else {
        let user_id = decoded.id;     // 토큰을 해독하여 아이디 추출.

        const connection = await pool.getConnection(async conn => conn);      // DB 연결 될 때 까지 잠시 대기.

        try {
          let select_query = "SELECT * FROM ?? where id = ?";
          let select_table = ["user",user_id];

          select_query = mysql.format(select_query,select_table);

          let [users] = await connection.query(select_query);
          user_name = users[0].name;
          console.log(users[0].name);
        }
        catch (err) {
          res.status(err.status_code || 500).json({"Success" : false, "Message" : err.message || 'unknown Error', "code" : err.status_code || 500});
        }
        finally {
          res.render('myDiary', { pass : true, user : user_name});
          connection.release();       // 연결을 해제.
        }
      }
    });
  }
  else {
    res.render('myDiary', { pass : false, user : user_name});
  }
});

router.post('/', async function(req, res) {
  let current = req.body.current;
  let token = req.cookies.ac_token;

  if (token) {
    jwt.verify(token, config.secret, async function (err, decoded) {
      if(err) {
        res.clearCookie('ac_token').redirect('/signin');
      }

      else {
        const connection = await pool.getConnection(async conn => conn);
        try {
          let user_id = decoded.id;     // 토큰을 해독하여 아이디 추출.

          let select_query = "SELECT created, happiness FROM ?? where created like ? and author = ?";
          let select_table = ["post",current+'%', user_id];

          select_query = mysql.format(select_query,select_table);

          let [posts] = await connection.query(select_query);

          let happiness = [];

          for (i=0; i<posts.length; i++) {
            let happiness_item = new Object();
            let regex = String(posts[i].created);

            let regexMatch = regex.match( /\w* \w* \d*/ )[0].split(" ")[2];

            happiness_item.day = regexMatch;
            happiness_item.score = posts[i].happiness;

            happiness[i] = happiness_item;
          }

          res.json({ score: happiness });
        }
        catch {
          res.status(err.status_code || 500).json({"Success" : false, "Message" : err.message || 'unknown Error', "code" : err.status_code || 500});
        }
        finally {
          connection.release();       // 연결을 해제.
        }
      }
    });
  }
});

module.exports = router;