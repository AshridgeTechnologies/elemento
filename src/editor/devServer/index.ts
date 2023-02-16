import express from 'express'
import http from 'http'
import * as readline from 'node:readline'
import { stdin as input, stdout as output } from 'node:process'
import cors from 'cors'
import { WebSocketServer } from 'ws'

const port = 3111
const app = express()
const rl = readline.createInterface({ input, output })


app.use(cors())
app.get('/welcome', (req, res) => {
    res.send('Welcome to the Elemento Webcontainer server! 🥳')
})

app.use(express.static('public'))

const server = http.createServer(app)

let websocketServer: WebSocketServer
try {
    websocketServer = new WebSocketServer({ server })

    websocketServer.on('connection', (webSocketClient) => {
        webSocketClient.send('{ "connection" : "ok"}')
        webSocketClient.on('message', (message) => {
            console.log('WS: ' + message)
        })
    })
} catch(e) { console.error('Error creating ws server', e) }

async function listenForMessages() {
    for await (const line of rl) {
        if (line.startsWith('WS:')) {
            const message = line.replace(/^WS: */, '')
            websocketServer.clients.forEach( client => { client.send(message); })
        }
    }
}

server.listen(port, () => {
    console.log(`App is live at http://localhost:${port}`)
    listenForMessages()
})
