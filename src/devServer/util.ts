import fs from 'fs'
import axios from 'axios'

export async function getModule(moduleUrl: string, moduleLocalPath: string, moduleName: string) {
    const moduleAlreadyDownloaded = fs.existsSync(moduleLocalPath)
    const moduleDate = moduleAlreadyDownloaded ? fs.statSync(moduleLocalPath).mtime : new Date(0)
    try {
        const resp = await axios.get(moduleUrl, {
            headers: {
                'If-Modified-Since': moduleDate.toUTCString(),
                'Cache-Control': 'max-age=31536000'
            },
            validateStatus: status => status >= 200 && status <= 304
        })
        if (resp.status === 304) {
            console.info(`Latest ${moduleName} already downloaded from`, moduleUrl)
            return true
        }
        if (resp.status !== 200) {
            throw new Error(resp.status + ' ' + resp.statusText)
        }
        const moduleContents = await resp.data
        await fs.promises.writeFile(moduleLocalPath, moduleContents)
        console.info(`Downloaded latest ${moduleName} from`, moduleUrl)
        return true
    } catch (e) {
        console.warn(`Cannot download latest ${moduleName} from`, moduleUrl, (e as Error).message)
        if (moduleAlreadyDownloaded) {
            console.warn(`Using previously downloaded version of ${moduleName}`)
            return true
        } else {
            return false
        }
    }
}