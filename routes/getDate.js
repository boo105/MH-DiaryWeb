// 시간자료형을 '년 월 일 시 분' 으로 바꿈 ( post는 객체 형태이므로 참조 방식임)
let getDate = function(post)
{
    let date = new Date(post.created);
    console.log(date);
    let month = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    let day = date.getDate();
    day = day < 10 ? '0' + day : day;

    let date_string = date.getFullYear() + '-' + month + '-' + day + ' ' + date.getHours() + ':' + date.getMinutes();
    post.created = date_string;
}

module.exports = getDate;