import Project from '../../model/Project'
import App from '../../model/App'
import {generate} from '../../generator/Generator'
import {gzipSync} from 'fflate'

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

export default class FirebaseDeploy {

    constructor(public project: Project, public deployment: {firebaseProject: string}) {}

    get app() {
        return this.project.elementArray().find( el => el.kind === 'App') as App
    }

    get codeFileName() { return `${this.app.codeName}.js` }

    async deploy() {
        console.log('Deploying')
        // const gapi = await getGapi()
        //
        //
        // type GapiResponse = {status: number, result: any}
        // const checkError = (response: GapiResponse): any => {
        //     if (response.status !== 200) {
        //         const {message} = response.result.error
        //         throw new Error(`Error deploying to ${this.deployment.firebaseProject}: ${message}`)
        //     }
        //
        //     return response.result
        // }
        // const sites = checkError(await gapi.client.firebasehosting.projects.sites.list({parent:`projects/${this.deployment.firebaseProject}`})).sites
        // console.log('sites', sites)
        //
        // const site = sites.find((s: any) => s.type === 'DEFAULT_SITE')
        // const version = checkError(await gapi.client.firebasehosting.sites.versions.create({parent:site.name}))
        // console.log('version', version)

        const files = await this.files()
        console.log(files)
    }

    private async files() {
        const files = {
            './index.html': {
                text: this.indexFile()
            },
            [`./${this.codeFileName}`]: {
                text: this.codeFile()
            },
            [`./${runtimeFileName}`]: {
                text: await this.runtimeLibFile()
            }
        }
        const addHashAndZip = async ({text}: { text: string }) => {
            const gzip = zipText(text)
            const hash = await hashData(gzip)
            return {text, gzip, hash}
        }

        for (let x in files) {
            files[x] = await addHashAndZip(files[x])
        }
        return files
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

