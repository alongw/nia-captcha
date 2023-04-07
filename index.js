const express = require('express');
const app = express();
const request = require('request');
const querystring = require('querystring');


const cors = require('cors')
app.use(cors())
app.use(express.json());

app.post('/check-ticket', (req, res) => {
    const ticket = req.body.ticket;
    const randstr = req.body.randstr;
    console.log(req.body);
    if (!ticket || !randstr) {
        res.status(400).send('参数不能为空');
        return;
    }

    checkTicket(ticket, randstr, (result) => {
        if (result === 1) {
            // 验证通过
            res.send('验证通过');
        } else if (result === -1) {
            // 接口已失效
            res.send('接口已失效');
        } else if (result === 0) {
            // 验证不通过
            res.send('验证不通过');
        }
    });
});

function checkTicket(ticket, randstr, callback) {
    const url = 'https://cgi.urlsec.qq.com/index.php?m=check&a=gw_check&callback=url_query&url=https%3A%2F%2Fwww.qq.com%2F' + Math.floor(Math.random() * (999999 - 111111 + 1) + 111111) + '&ticket=' + encodeURIComponent(ticket) + '&randstr=' + encodeURIComponent(randstr);

    const options = {
        url: url,
        headers: {
            'Accept': 'application/json',
            'Accept-Language': 'zh-CN,zh;q=0.8',
            'Connection': 'close',
            'Referer': 'https://urlsec.qq.com/check.html',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
        },
        rejectUnauthorized: false
    };

    request(options, (error, response, body) => {
        if (error) {
            callback(-1);
        } else {
            const arr = jsonpDecode(body);
            if (arr.reCode === 0) {
                callback(1);
            } else if (arr.reCode === -109) {
                callback(0);
            } else {
                callback(-1);
            }
        }
    });
}



function jsonpDecode(jsonp) {
    jsonp = jsonp.trim();
    let begin = 0;
    let end = 0;

    if (jsonp[0] !== '[' && jsonp[0] !== '{') {
        begin = jsonp.indexOf('(');
        if (begin !== -1) {
            end = jsonp.lastIndexOf(')');
            if (end !== -1) {
                jsonp = jsonp.substring(begin + 1, end);
            }
        }
    }

    return JSON.parse(jsonp);
}

app.listen(6688, () => {
    console.log('API Server is running.');
});
