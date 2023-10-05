# nia - captcha

## 前言

> 严正声明：本人并不知道 captcha 之类的是什么东西，本仓库内容都是在一个地上捡的 U 盘里找到的

网上有一套很火的方案，原理差不多是 `转嫁` 验证码来实现验证目的，你去网上搜索 “阿巴阿巴阿巴...” 这样的内容，出来的 99% 都是同一套代码和内容，一个 php，一个 html  *~~部分缺德网站还 tm 要钱~~* ，html 里引入验证码然后 Ajax 调用一下后端，然后后端返回结果

但是网上的都是 PHP 实现的，对于 vue 和 node 来说，并没有可以直接套用的代码，因此理论成立，实战开始

还有就是本仓库修改 `dynamic-tencent-captcha` 这个包，因为这个包有一些问题导致无法正常使用（指本仓库使用的方法）。这些问题困扰了我一个星期。

本仓库仅供学习和交流，请在下载后的24小时内删除，严禁用于任何开发项目。侵权请联系删除。

## 使用教程

在实践前请先查看 demo ，因为坑确实挺多的

### 客户端

客户端的使用方式与正规的使用方式相同，但是不要使用新版的验证码，原因见下文

#### 原生 html

[Demo](https://github.com/alongw/nia-captcha/blob/main/demo-web/index.html) 点此

引入腾讯云验证码依赖（为确保安全，强烈推荐使用本地）

```html
<script src="https://ssl.captcha.qq.com/TCaptcha.js"></script>
```

注意，不要将里面的地址更换成 2023年07月18日 版本的！就是不要换成 `https://turing.captcha.qcloud.com/TCaptcha.js` ，具体原因嘛.... 你猜猜他为什么要升级安全性~

如果地址失效，可下载备份本地引入 https://github.com/alongw/TencentCaptcha/blob/main/demo-web/ssl.captcha.qq.com_TCaptcha.js

引入 Axios

```html
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
```

调用验证码（具体见 https://cloud.tencent.com/document/product/1110/36841 ），`CaptchaAppId` 自行决定，与后端验证的地址匹配既可

```javascript
const captcha = new TencentCaptcha('2046626881', async (e) => {
	console.log(e)
    if (e.ret == 2) {
		// ...
	}
    if (e.ret == 0) {
    	// ...
	}
})
captcha.show()
```

`e` 字段说明

| 字段名       | 值类型 | 说明                                                         |
| ------------ | ------ | ------------------------------------------------------------ |
| ret          | Int    | 验证结果，0：验证成功。2：用户主动关闭验证码。               |
| ticket       | String | 验证成功的票据，当且仅当 ret = 0 时 ticket 有值。            |
| CaptchaAppId | String | 验证码应用 ID。                                              |
| bizState     | Any    | 自定义透传参数。                                             |
| randstr      | String | 本次验证的随机串，后续票据校验时需传递该参数。               |
| errorCode    | Number | 错误 code ，详情请参见 [回调函数 errorCode 说明](https://cloud.tencent.com/document/product/1110/36841#errorCode)。 |
| errorMessage | String | 错误信息。                                                   |

#### VUE

[Demo](https://github.com/alongw/nia-captcha/blob/main/demo-vue) 点此

安装验证码依赖

```bash
yarn add nia-captcha
```

当然，你也可以安装原版的，但是我修改的将解决上文所说的增加安全性的问题，并且在未来将集成 `CaptchaAppId` 和更多功能

```bash
yarn add dynamic-tencent-captcha # 原版的包
```

引入并使用验证码，后续步骤与上面原生相同

```vue
<script setup>
import getCaptcha from 'nia-captcha'

const click = async () => {
    try {
        const captcha = await getCaptcha('2046626881')
        console.log(captcha)
        // ...
    } catch (error) {
        // 用户关闭验证码
        // ...
    }
}
</script>

<template>
    <button @click="click()">Click Me</button>
</template>
```

该包暂不支持跟配置对象，在未来会完善

### 服务端

在后台，"转嫁" 验证码，对用户的提交进行效验

[Demo](https://github.com/alongw/nia-captcha/blob/main/src) 点此

验证地址和请求头并非要求相同，地址申请逻辑视情况而定

```typescript
try {
        const response: AxiosResponse = await axios.get(
            `https://cgi.urlsec.qq.com/index.php?m=check&a=gw_check&callback=url_query&url=https%3A%2F%2Fwww.qq.com%2F${Math.floor(
                Math.random() * (999999 - 111111 + 1) + 111111
            )}&ticket=${encodeURIComponent(
            	// ...
            )}&randstr=${encodeURIComponent(
                // ...
            )}`,
            {
                headers: {
                    Accept: 'application/json',
                    'Accept-Language': 'zh-CN,zh;q=0.8',
                    Connection: 'close',
                    Referer: 'https://urlsec.qq.com/check.html',
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
                }
            }
        )

        const arr = jsonpDecode<{
            reCode: number
            data: string
        }>(response.data)

        if (arr.reCode === 0) {
            // ...
        } else if (arr.reCode === -109) {
            // ...
        } else {
            // ...
        }
    } catch (error) {
        // ...
    }
```

在 [demo](https://github.com/alongw/nia-captcha/blob/main/src/utils/captcha.ts) 代码中，我们将他封装成了一个模块以便接收验证

可以搭建一个专用的验证服务器，避免重复代码。在未来，我们将会将后端逻辑集成在 `nia-captcha` 包中

#### 搭建一个接口用于处理代码

```typescript
import { Router } from 'express'

import { checkTicket } from './../utils/captcha'

import type { Request } from './../types/Request'

const router = Router()

router.post(
    '/',
    async (
        req: Request<{
            ticket?: string
            randstr?: string
        }>,
        res
    ) => {
        if (!req.body.ticket || !req.body.randstr) {
            return res.send({
                status: -1,
                msg: '缺少ticket或randstr'
            })
        }
        const { msg, status } = await checkTicket(req.body.ticket, req.body.randstr)

        // ...

        res.send({
            status,
            msg
        })
    }
)

export default router

```

#### 封装处理模块

```typescript
import axios, { AxiosResponse } from 'axios'

export async function checkTicket(
    ticket: string,
    randstr: string
): Promise<{
    status: number
    msg: string
}> {
    try {
        const response: AxiosResponse = await axios.get(
            `https://cgi.urlsec.qq.com/index.php?m=check&a=gw_check&callback=url_query&url=https%3A%2F%2Fwww.qq.com%2F${Math.floor(
                Math.random() * (999999 - 111111 + 1) + 111111
            )}&ticket=${encodeURIComponent(ticket)}&randstr=${encodeURIComponent(
                randstr
            )}`,
            {
                headers: {
                    Accept: 'application/json',
                    'Accept-Language': 'zh-CN,zh;q=0.8',
                    Connection: 'close',
                    Referer: 'https://urlsec.qq.com/check.html',
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
                }
            }
        )

        const arr = jsonpDecode<{
            reCode: number
            data: string
        }>(response.data)

        if (arr.reCode === 0) {
            return {
                status: 200,
                msg: arr.data
            }
        } else if (arr.reCode === -109) {
            return {
                status: 403,
                msg: arr.data
            }
        } else {
            return {
                status: 403,
                msg: arr.data
            }
        }
    } catch (error) {
        return {
            status: 500,
            msg: '服务器错误'
        }
    }
}

const jsonpDecode = <T>(jsonp: string): T => {
    jsonp = jsonp.trim()
    let begin = 0
    let end = 0

    if (jsonp[0] !== '[' && jsonp[0] !== '{') {
        begin = jsonp.indexOf('(')
        if (begin !== -1) {
            end = jsonp.lastIndexOf(')')
            if (end !== -1) {
                jsonp = jsonp.substring(begin + 1, end)
            }
        }
    }

    return JSON.parse(jsonp)
}

```

## 最后

> 严正声明：本人并不知道 captcha 之类的是什么东西，以上内容都是在一个地上捡的 U 盘里找到的
