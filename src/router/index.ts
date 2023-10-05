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
