import Project from '../../model/Project'
import App from '../../model/App'
import {generate} from '../../generator/Generator'
import {gzipSync} from 'fflate'
import JSZip from 'jszip'
import getGapi from './gapiProvider'
import {mapObjIndexed} from 'ramda'
import ServerApp from '../../model/ServerApp'
import ServerAppGenerator from '../../generator/ServerAppGenerator'

const runtimeFileName = 'runtime.js'
const runtimeFileSourceUrl = '/runtime/index.js'
const serverRuntimeFileSourceUrl = '/serverRuntime/index.js'

function zipText(text: string) {
    const uint8array = new TextEncoder().encode(text)
    return gzipSync(uint8array)
}

const wait = (time: number): Promise<void> => new Promise(resolve => setTimeout(resolve, time))

type FileInfo = { name: string, content: string }

function zipFiles(files: FileInfo[]) {
    const zip = new JSZip()
    files.forEach( f => zip.file(f.name, f.content))
    return zip.generateAsync({type: 'uint8array'})
}

async function hashData(data: BufferSource) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

type GapiResponse = {status: number, result: any}
async function uploadFile(uploadUrl: string, filePath: string, hash: string, data: BufferSource) {
    const token = gapi.client.getToken()
    const options = {
        method:  'POST',
        headers: {
            'Authorization': 'Bearer ' + token.access_token,
            'Content-Type':  'application/octet-stream',
        },
        body: data,
    }

    await fetch(uploadUrl + '/' + hash, options)
}

export default class FirebaseDeploy {

    constructor(public project: Project, public deployment: {firebaseProject: string}) {}

    get app() {
        return this.project.elementArray().find( el => el.kind === 'App') as App
    }

    get serverApp() {
        return this.project.elementArray().find( el => el.kind === 'ServerApp') as ServerApp
    }

    get codeFileName() { return `${this.app.codeName}.js` }

    async deploy() {
        console.log('Deploying')
        const gapi = await getGapi()

        if (this.serverApp) {
           await this.deployFunctions(gapi)
        }

        const sites = this.checkError(await gapi.client.firebasehosting.projects.sites.list({parent:`projects/${this.deployment.firebaseProject}`})).sites
        console.log('sites', sites)

        const site = sites.find((s: any) => s.type === 'DEFAULT_SITE')
        const version = this.checkError(await gapi.client.firebasehosting.sites.versions.create({parent: site.name}))
        console.log('version', version)

        const files = await this.files()
        console.log(files)

        const filesToPopulate = mapObjIndexed( ({hash}) => hash, files )
        const populateFilesResult = this.checkError(await gapi.client.firebasehosting.sites.versions.populateFiles({
            parent: version.name,
            files: filesToPopulate
        }))
        console.log('populateFilesResult', populateFilesResult)

        const {uploadUrl, uploadRequiredHashes} = populateFilesResult
        console.log('uploadUrl', uploadUrl, 'hashes', uploadRequiredHashes)

        const uploadPromises = uploadRequiredHashes.map( async (hash: string) => {
            const file = Object.values(files).find(f => f.hash === hash)
            const {filePath, gzip} = file!
            try {
                await uploadFile(uploadUrl, filePath, hash, gzip)
                console.log('Uploaded', filePath)
            } catch (err) {
                console.error('Failed to upload', filePath, err)
                throw err
            }
        })

        await Promise.all(uploadPromises)

        const serverAppName = this.serverApp?.codeName?.toLowerCase()
        const rewrites = serverAppName ? [{
            glob: `/${serverAppName}/**`,
            run: {serviceId: 'serverapp1', region: 'europe-west2'}}
        ] : []
        const patchResult = this.checkError(await gapi.client.firebasehosting.sites.versions.patch({
            name: version.name,
            updateMask: 'status,config',
            status: 'FINALIZED',
            config: {
                rewrites
            }
        }))
        console.log('patch', patchResult)

        const releaseResult = this.checkError(await gapi.client.firebasehosting.sites.releases.create({
            parent: site.name,
            versionName: version.name,
        }))
        console.log('release', releaseResult)
    }

    async deployFunctions(gapi: any) {
        console.log('Deploying functions')
        const gen = new ServerAppGenerator(this.serverApp)
        const generatedFiles = gen.output().files
        console.log('generatedFiles', generatedFiles)
        const staticFiles = [{name: 'serverRuntime.js', content: await this.serverRuntimeLibFile()}]
        const files = [...generatedFiles, ...staticFiles]
        const sourceZipData = await zipFiles(files)

        const project = this.checkError(await gapi.client.firebase.projects.get({name: `projects/${this.deployment.firebaseProject}`}))
        const {locationId} = project.resources
        const functionName = this.serverApp.codeName.toLowerCase()
        const name = `projects/${this.deployment.firebaseProject}/locations/${locationId}/functions/${functionName}`
        let existingFunction
        try {
            const response = await gapi.client.cloudfunctions.projects.locations.functions.get({name})
            existingFunction = this.checkError(response)
        } catch (err: any) {
            existingFunction = err.status === 404 ? null : this.checkError(err)
        }
        console.log('existingFunction', existingFunction)

        const uploadUrlInfo = this.checkError(await gapi.client.cloudfunctions.projects.locations.functions.generateUploadUrl({
            parent: `projects/${this.deployment.firebaseProject}/locations/${locationId}`,
        }))
        console.log('uploadUrlInfo', uploadUrlInfo)
        const uploadUrl = new URL(uploadUrlInfo.uploadUrl)
        console.log('uploadUrl', uploadUrl)

        const uploadProxyUrl = `${location.origin}/uploadfunctioncontent?path=${uploadUrl.pathname}&${uploadUrl.search.substring(1)}`
        await fetch(uploadProxyUrl, {
            method: 'PUT',
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/zip'
            },
            body: sourceZipData
        })

        const functionInfo = {
            name,
            description: 'Elemento Server App',
            buildConfig: {
                runtime: 'nodejs16',
                source: {
                    storageSource: uploadUrlInfo.storageSource
                }
            }
        }

        let functionResponse
        if (!existingFunction) {
            functionResponse = await gapi.client.cloudfunctions.projects.locations.functions.create({
                parent: `projects/${this.deployment.firebaseProject}/locations/${locationId}`,
                functionId: functionName,
                resource: functionInfo
            })
        } else {
            functionResponse = await gapi.client.cloudfunctions.projects.locations.functions.patch({
                name: existingFunction.name,
                resource: functionInfo
            })
        }

        console.log('function response', functionResponse)

        let operation = this.checkError(functionResponse)

        console.log('Waiting for function deployment...')
        let attempts = 0
        while (!operation.done && ++attempts < 20) {
            await wait(5000)
            const opName = operation.name
            console.log('polling operation result', attempts)
            operation = this.checkError(await gapi.client.cloudfunctions.projects.locations.operations.get({name: opName}))
        }

        console.log('operation result', operation)
        if (!operation.done) {
            throw new Error('Timed out waiting for function deployment')
        }

        if (operation.error) {
            throw operation.error
        }

        console.log('Function deployment complete')
    }

    private checkError(response: GapiResponse): any{
        if (response.status !== 200) {
            const {message} = response.result.error
            throw new Error(`Error deploying to ${this.deployment.firebaseProject}: ${message}`)
        }

        return response.result
    }


    private async webApp() {
        // @ts-ignore
        const webApps = this.checkError(await gapi.client.firebase.projects.webApps.list({parent:`projects/${this.deployment.firebaseProject}`})).apps
        console.log('webapps', webApps)

        const webApp = webApps.find((s: any) => s.state === 'ACTIVE')
        console.log('webapp', webApp)
        return webApp
    }

    private async files(): Promise<{[path: string] : {filePath: string, text: string, hash: string, gzip: Uint8Array}}> {
        const files = {
            '/index.html': {
                text: this.indexFile()
            },
            '/firebaseConfig.json': {
                text: await this.configFile()
            },
            [`/${this.codeFileName}`]: {
                text: this.codeFile()
            },
            [`/${runtimeFileName}`]: {
                text: await this.runtimeLibFile()
            }
        }
        const addHashAndZip = async (filePath: string, {text}: { text: string }) => {
            const gzip = zipText(text)
            const hash = await hashData(gzip)
            return {filePath, text, gzip, hash}
        }

        const fileEntryPromises = Object.entries(files).map(async ([filePath, value]) => [filePath, await addHashAndZip(filePath, value)])
        const fullFileEntries = await Promise.all(fileEntryPromises)
        return Object.fromEntries(fullFileEntries)
    }

    private codeFile() {
        const imports = [
            `import * as Elemento from "./${runtimeFileName}"`,
            `const {React} = Elemento`
        ]

        return generate(this.app, imports).code
    }

    private runtimeLibFile() {
        return fetch(runtimeFileSourceUrl).then(resp => resp.text())
    }

    private serverRuntimeLibFile() {
        return fetch(serverRuntimeFileSourceUrl).then(resp => resp.text())
    }

    private async configFile() {
        const webApp = await this.webApp()
        // @ts-ignore
        const config = this.checkError(await gapi.client.firebase.projects.webApps.getConfig({name:`projects/${this.deployment.firebaseProject}/webApps/${webApp.appId}/config`}))
        console.log('config', config)
        return JSON.stringify(config, null, 2)
    }

    private indexFile() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="initial-scale=1, width=device-width" />
  <title>${this.app.name}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
  <style>
    body { margin: 0; padding: 0}
    #main { height: calc(100vh - 8px); width: calc(100vw - 8px); margin: 4px }
  </style>
</head>
<body>

<script type="module">
    import * as Elemento from "./${runtimeFileName}"
    import ${this.app.codeName} from "./${this.codeFileName}"

    Elemento.run(${this.app.codeName})
</script>

</body>
</html>
`
    }
}

