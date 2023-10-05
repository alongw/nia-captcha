import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

import Router from './router'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors())

app.use('/', Router)

app.listen(3000, () => {
    console.log('app listening on port 3000')
})
