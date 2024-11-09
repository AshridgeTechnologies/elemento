import * as Module from 'module'
import os from 'os'
import {promises as Fs} from 'fs'
import path from 'path'

async function exists (path: string) {
    try {
        await Fs.access(path)
        return true
    } catch {
        return false
    }
}

export async function loadModuleHttp(url: string): Promise<Module> {
    const tempDir = os.tmpdir()
    const urlAsFilePath = url.replace(/:/g, '')
    const importFilePath = path.join(tempDir, urlAsFilePath)
    if (!(await exists(importFilePath))) {
        const fileContents = await fetch(url).then( resp => resp.text())
        await Fs.writeFile(importFilePath, fileContents)
    }

    return import(importFilePath)
}