import path from 'path'
import {getModule} from './util'
import fs from 'fs'
import os from 'os'

const elementoHost = process.argv[2] ?? process.env['ELEMENTO_URL'] ?? 'https://elemento.online'
export const elementoDirPath = path.join(os.homedir(), '.elemento')

async function runDevServer() {
    fs.mkdirSync(elementoDirPath, {recursive: true})
    const devServerModulePath = path.join(elementoDirPath, 'devServer.cjs')
    const devServerDownloaded = await getModule(`${elementoHost}/devServer/devServer.cjs`, devServerModulePath, 'development server')
    if (devServerDownloaded) {
        const {run} = await import('file://' + devServerModulePath)
        run(elementoHost, elementoDirPath)
    } else {
        console.error(`Cannot start development server`)
    }
}

runDevServer()
