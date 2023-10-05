declare interface TencentCaptchaOptions {

}
declare interface TencentCaptchaResult {
  ret:number  
  ticket?:string
  CaptchaAppId?:string
  bizState ?: any
  randstr ?: string

  errorCode ?: number
  errorMessage ?: string
}
declare type TencentCaptchaCallback = (params:TencentCaptchaResult)=>void
/**
 * @see https://cloud.tencent.com/document/product/1110/36841
 */
declare class TencentCaptcha {
  constructor(appid:string, callback: TencentCaptchaCallback, options?: TencentCaptchaOptions);
  show();
}