import {errorHandler} from '../serverRuntime/expressUtils'
import express from 'express'

import fs from 'fs'
import path from 'path'
import {identity, last, sortBy} from 'ramda'
import cors from 'cors'
import {getModule} from './util'
import {AppFactory, requestHandler} from '../serverRuntime/requestHandler'


export async function run(elementoHost: string, elementoDirPath: string) {
    const elementoFilesPath = path.join(elementoDirPath, 'devFiles')

    const appFactory: AppFactory = async (appName,user) => {
        const filenames = fs.readdirSync(elementoFilesPath)
        const appFilenames = filenames.filter( f => f.match(new RegExp(`^${appName}_\\d+\\.[cm]js\$`)))
        const latestFile = last(sortBy(identity, appFilenames)) as string
        const serverAppModule = await import('file://' + path.join(elementoFilesPath, latestFile ))
        const serverApp = serverAppModule.default
        return serverApp(user)
    }

    fs.mkdirSync(elementoFilesPath, {recursive: true})
    console.log('Storing files in', elementoFilesPath)
    const serverRuntimeModulePath = path.join(elementoDirPath, 'devFiles', 'serverRuntime.cjs')
    const serverRuntimeOk = await getModule(`${elementoHost}/serverRuntime/serverRuntime.cjs`, serverRuntimeModulePath, 'server runtime')
    if (!serverRuntimeOk) {
        throw new Error('Could not start development server')
    }

    fs.mkdirSync(elementoFilesPath, {recursive: true})
    const devServer = express()

    devServer.use(express.text({type: 'text/plain', limit: '25mb'}))
    devServer.use(cors({
        origin: [elementoHost],
        methods: 'PUT',
        preflightContinue: false,
        optionsSuccessStatus: 204
    }))

    devServer.put('/file/:filename', (req, res) => {
        const timestamp = Date.now()
        const {filename} = req.params
        const [filenameBase, filenameExt] = filename.split('.')
        const filenameWithTimestamp = `${filenameBase}_${timestamp}.${filenameExt}`
        const fullFilePath = path.join(elementoFilesPath, filenameWithTimestamp)
        fs.writeFileSync(fullFilePath, req.body)
        res.send()
    })

    devServer.use(express.json())
    devServer.use('/capi', requestHandler(appFactory))
    devServer.use(errorHandler)

    const port = 4444
    devServer.listen(port, () => console.log('Elemento Development server started on port', port))
}
