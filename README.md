# 腾讯云验证码

利用现成的腾讯云验证码实现白嫖使用

具体使用方法查看：https://cloud.tencent.com/document/product/1110/36841

直接照搬了网上很火的那一个，找了很久也没找到原作者，网上给的是用ajax调用后端用php，我把他改成了axios调用后端用node

本仓库仅供学习和交流，请在下载后的24小时内删除，严禁用于任何开发项目

## 使用教程

### 客户端

引入腾讯云验证码依赖

```html
<script src="https://ssl.captcha.qq.com/TCaptcha.js"></script>
```

引入axios

```html
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
```

使用（其中`CaptchaAppId`填`'2046626881'`）

```js
const captchaw = new TencentCaptcha(CaptchaAppId, callback, options)
captchaw.show()
```

回调函数

```js
const tcaptchaCallback = res => {
            if (res.ret == 2) {
                // 用户主动关闭验证码弹窗
                console.log('用户主动关闭验证码');
            }
            if (res.ret == 0) {
                // 用户通过验证 向自己的服务器发送请求
                axios.post('http://127.0.0.1:6688/check-ticket', {
                    ticket: res.ticket,
                    randstr: res.randstr
                }).then(res2 => {
                    // 请求发送成功
                    console.log('请求发送成功');
                    console.log(res2.data);
                }).catch(err => {
                    // 请求发送错误
                    console.log('请求发送错误');
                    console.log(err);
                });
            }
        }
```

回调结果字段说明

| 字段名       | 值类型 | 说明                                                         |
| :----------- | :----- | :----------------------------------------------------------- |
| ret          | Int    | 验证结果，0：验证成功。2：用户主动关闭验证码。               |
| ticket       | String | 验证成功的票据，当且仅当 ret = 0 时 ticket 有值。            |
| CaptchaAppId | String | 验证码应用 ID。                                              |
| bizState     | Any    | 自定义透传参数。                                             |
| randstr      | String | 本次验证的随机串，后续票据校验时需传递该参数。               |
| errorCode    | Number | 错误 code ，详情请参见 [回调函数 errorCode 说明](https://cloud.tencent.com/document/product/1110/36841#errorCode)。 |
| errorMessage | String | 错误信息。                                                   |



## DEMO

### 客户端

```
const yzm = () => {
            const captchaw = new TencentCaptcha('2046626881', tcaptchaCallback);
            captchaw.show();
        }
const tcaptchaCallback = res => {
            if (res.ret == 2) {
                // 用户主动关闭验证码弹窗
                console.log('用户主动关闭验证码');
            }
            if (res.ret == 0) {
                // 用户通过验证 向自己的服务器发送请求
                axios.post('http://127.0.0.1:6688/check-ticket', {
                    ticket: res.ticket,
                    randstr: res.randstr
                }).then(res2 => {
                    // 请求发送成功
                    console.log('请求发送成功');
                    console.log(res2.data);
                }).catch(err => {
                    // 请求发送错误
                    console.log('请求发送错误');
                    console.log(err);
                });
            }
        }
```



### 服务端

```js
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

```

