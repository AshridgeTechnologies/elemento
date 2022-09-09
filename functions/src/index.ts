import * as functions from 'firebase-functions'
import axios from 'axios'
import express from 'express'

const app = express()

app.use(express.raw({type: 'application/zip'}))
app.use( (req, res, next) => {
    console.log(req.method, req.url)
    next()
})
app.put('/uploadfunctioncontent', async (req, res) => {
    try {
        const data = req.body
        const {path, GoogleAccessId, Expires, Signature} = req.query
        const url = `https://storage.googleapis.com${path}?GoogleAccessId=${GoogleAccessId}&Expires=${Expires}&Signature=${encodeURIComponent(Signature as string)}`
        console.log('upload url', url)

        await axios.put(url, data, {
            headers: {
                'Content-Type': req.headers['content-type'] as string
            }
        })
        res.end()
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
})

export const uploadfunctioncontent = functions.https.onRequest(app)
