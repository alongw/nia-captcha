import { asyncLoadScript } from './ScriptLoader'
export type AppIdGetter = () => Promise<string>
export type CaptchaResult = {
    ticket: string
    CaptchaAppId: string
    randstr: string
}
export const getTencentCaptchaCls = async () => {
    const ret = window.TencentCaptcha
    if (ret) return ret
    // await asyncLoadScript('head', { src: 'https://turing.captcha.qcloud.com/TCaptcha.js' })
    await asyncLoadScript('head', { src: 'https://ssl.captcha.qq.com/TCaptcha.js' })
    return window.TencentCaptcha!!
}
export default async function getCaptcha(appid: string) {
    const TencentCaptcha = await getTencentCaptchaCls()
    return new Promise<CaptchaResult>((resolve, reject) => {
        new TencentCaptcha(appid, (res: TencentCaptchaResult) => {
            const { ret, ticket, randstr } = res
            if (ret === 0) {
                if (!appid) {
                    reject(new Error(`无法获取验证码 appid got ${appid}`))
                } else if (!randstr) {
                    reject(new Error(`无法获取验证码 randstr got ${randstr}`))
                } else if (!ticket) {
                    reject(new Error(`无法获取验证码 ticket got ${ticket}`))
                } else {
                    resolve({ CaptchaAppId: appid, randstr, ticket })
                }
            } else if (res.ret === 2) {
                reject(new Error('你已取消图形验证'))
            } else {
                reject(new Error(`无法获取验证码 [${res.errorCode}]${res.errorMessage}`))
            }
        }).show()
    })
}
