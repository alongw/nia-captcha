import { Request as ExpressRequest } from 'express'
// import { ParsedQs } from 'qs'

export interface Request<
    B = {},
    Q extends ExpressRequest['query'] = {},
    P extends ExpressRequest['params'] = {}
> extends ExpressRequest {
    params: P
    query: Q
    body: B
}
