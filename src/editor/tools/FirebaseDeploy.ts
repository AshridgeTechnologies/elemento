import Project from '../../model/Project'
import App from '../../model/App'
import {generate} from '../../generator/Generator'
import {gzipSync} from 'fflate'
import getGapi from './gapiProvider'
import {mapObjIndexed} from 'ramda'

const runtimeFileName = 'runtime.js'
const runtimeFileSourceUrl = '/runtime/index.js'

function zipText(text: string) {
    const uint8array = new TextEncoder().encode(text)
    return gzipSync(uint8array)
}

async function hashData(data: BufferSource) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

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

    get codeFileName() { return `${this.app.codeName}.js` }

    async deploy() {
        console.log('Deploying')
        const gapi = await getGapi()

        type GapiResponse = {status: number, result: any}
        const checkError = (response: GapiResponse): any => {
            if (response.status !== 200) {
                const {message} = response.result.error
                throw new Error(`Error deploying to ${this.deployment.firebaseProject}: ${message}`)
            }

            return response.result
        }
        const sites = checkError(await gapi.client.firebasehosting.projects.sites.list({parent:`projects/${this.deployment.firebaseProject}`})).sites
        console.log('sites', sites)

        const site = sites.find((s: any) => s.type === 'DEFAULT_SITE')
        const version = checkError(await gapi.client.firebasehosting.sites.versions.create({parent: site.name}))
        console.log('version', version)

        const files = await this.files()
        console.log(files)

        const filesToPopulate = mapObjIndexed( ({hash}) => hash, files )
        const populateFilesResult = checkError(await gapi.client.firebasehosting.sites.versions.populateFiles({
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

        const patchResult = checkError(await gapi.client.firebasehosting.sites.versions.patch({
            name: version.name,
            updateMask: 'status',
            status: 'FINALIZED'
        }))
        console.log('patch', patchResult)

        const releaseResult = checkError(await gapi.client.firebasehosting.sites.releases.create({
            parent: site.name,
            versionName: version.name,
        }))
        console.log('release', releaseResult)


    }

    private async files(): Promise<{[path: string] : {filePath: string, text: string, hash: string, gzip: Uint8Array}}> {
        const files = {
            '/index.html': {
                text: this.indexFile()
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

    private indexFile() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${this.app.name}</title>
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

