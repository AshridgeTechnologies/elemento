import Project from '../model/Project'
import App from '../model/App'
import {generate, generateTypes} from './Generator'
import ServerApp from '../model/ServerApp'
import ServerAppGenerator from './ServerAppGenerator'
import FirebasePublish from '../model/FirebasePublish'
import {runtimeFileName, runtimeFileSourcePath, serverRuntimeFileSourcePath} from './Types'

export type FileCollection = { [p: string]: { contents: string | Uint8Array } }

export const findServerApp = (project: Project) => {
    const element = project.elementArray().find(el => el.kind === 'ServerApp')
    return element as (ServerApp | undefined)
}

export default class Builder {

    constructor(public project: Project, private elementoUrl: string) {}

    get app() {
        return this.project.elementArray().find( el => el.kind === 'App') as App
    }

    get serverApp() {
        return findServerApp(this.project)
    }

    get codeFileName() { return `${this.app.codeName}.js` }
    get serverCodeFileName() { return this.serverApp && `${this.serverApp.codeName}.mjs` }

    dataTypesFiles() {
        const {files} = generateTypes(this.project)
        const fileEntries = files.map( ({contents, name}) => [name, {contents}])
        return Object.fromEntries(fileEntries)
    }

    async clientFiles(firebasePublish?: FirebasePublish): Promise<FileCollection> {
        const typesFiles: FileCollection = this.dataTypesFiles()
        const config = {
            '/index.html':              {contents: this.indexFile()},
            [`/${this.codeFileName}`]:  {contents: this.clientCodeFile()},
            ...typesFiles,
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
        const gen = new ServerAppGenerator(this.serverApp!)
        const generatedFiles = Object.fromEntries( gen.output().files.map(({name, contents}) => [name, {contents}]) )
        const staticFiles = {
            'serverRuntime.cjs': {contents: await this.loadFile(serverRuntimeFileSourcePath)},
            'serverRuntime.cjs.map': {contents: await this.loadFile(serverRuntimeFileSourcePath + '.map')},
        }
        return {...generatedFiles, ...staticFiles}
    }

    public clientCodeFile() {
        const imports = [
            `import * as Elemento from "./${runtimeFileName}"`,
            `const {React} = Elemento`
        ]

        return generate(this.app, this.project, imports).code
    }

    public serverCodeFile() {
        const gen = new ServerAppGenerator(this.serverApp!)
        const {contents} = gen.serverApp()
        return contents
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
