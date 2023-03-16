import Project from '../model/Project'
import App from '../model/App'
import {generate} from './Generator'
import ServerApp from '../model/ServerApp'
import ServerAppGenerator from './ServerAppGenerator'
import FirebasePublish from '../model/FirebasePublish'
import {valueLiteral} from './generatorHelpers'

export type FileCollection = { [p: string]: { contents: string | Uint8Array } }

const runtimeFileName = 'runtime.js'
const runtimeFileSourcePath = '/runtime/runtime.js'
const serverRuntimeFileSourcePath = '/serverRuntime/serverRuntime.js'

export default class Builder {

    constructor(public project: Project, private elementoUrl: string) {}

    get app() {
        return this.project.elementArray().find( el => el.kind === 'App') as App
    }

    get serverApp() {
        return this.project.elementArray().find( el => el.kind === 'ServerApp') as ServerApp
    }

    get codeFileName() { return `${this.app.codeName}.js` }
    async clientFiles(firebasePublish?: FirebasePublish): Promise<FileCollection> {
        const config = {
            '/index.html':              {contents: this.indexFile()},
            [`/${this.codeFileName}`]:  {contents: this.codeFile()},
            [`/${runtimeFileName}`]:    {contents: await this.loadFile(runtimeFileSourcePath)},
            [`/${runtimeFileName}.map`]: {contents: await this.loadFile(runtimeFileSourcePath + '.map')}
        }

        if (firebasePublish) {
            const firebaseConfig = await firebasePublish.getConfig()
            const configJson = JSON.stringify(firebaseConfig, null, 2)
            config['/firebaseConfig.json'] = {contents: configJson}
        }

        return config
    }

    async serverFiles(): Promise<FileCollection> {
        const gen = new ServerAppGenerator(this.serverApp)
        const generatedFiles = Object.fromEntries( gen.output().files.map(({name, contents}) => [name, {contents}]) )
        //console.log('generatedFiles', generatedFiles)
        const staticFiles = {
            'serverRuntime.js': {contents: await this.loadFile(serverRuntimeFileSourcePath)},
            'serverRuntime.js.map': {contents: await this.loadFile(serverRuntimeFileSourcePath + '.map')},
        }
        return {...generatedFiles, ...staticFiles}
    }

    public codeFile() {
        const imports = [
            `import * as Elemento from "./${runtimeFileName}"`,
            `const {React} = Elemento`
        ]

        return generate(this.app, this.project, imports).code
    }

    private loadFile(path: string) {  // path must start with /
        const fullUrl = `${this.elementoUrl}${path}`
        return fetch(fullUrl)
            .then( resp => {
                console.log('Download', fullUrl, 'status', resp.status)
                if (!resp.ok) throw new Error(`Could not fetch ${fullUrl} status ${resp.status} ${resp.statusText}`)
                return resp
            })
            .then(resp => resp.text())
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
    import {runForDev} from "./${runtimeFileName}"
    runForDev('./${this.codeFileName}')
</script>

</body>
</html>
`
    }
}