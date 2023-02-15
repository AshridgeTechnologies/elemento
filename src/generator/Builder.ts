import Project from '../model/Project'
import App from '../model/App'
import {generate} from './Generator'
import ServerApp from '../model/ServerApp'
import ServerAppGenerator from './ServerAppGenerator'

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
    async clientFiles(): Promise<{[path: string] : {text: string}}> {
        return {
            '/index.html':              {text: this.indexFile()},
            //'/firebaseConfig.json':     // downloaded and inserted by build script
            [`/${this.codeFileName}`]:  {text: this.codeFile()},
            [`/${runtimeFileName}`]:    {text: await this.loadFile(runtimeFileSourcePath)},
            [`/${runtimeFileName}.map`]: {text: await this.loadFile(runtimeFileSourcePath + '.map')}
        }
    }

    async serverFiles(): Promise<{[path: string] : {text: string}}> {
        const gen = new ServerAppGenerator(this.serverApp)
        const generatedFiles = Object.fromEntries( gen.output().files.map(({name, content}) => [name, {text: content}]) )
        //console.log('generatedFiles', generatedFiles)
        const staticFiles = {
            'serverRuntime.js': {text: await this.loadFile(serverRuntimeFileSourcePath)},
            'serverRuntime.js.map': {text: await this.loadFile(serverRuntimeFileSourcePath + '.map')},
        }
        return {...generatedFiles, ...staticFiles}
    }

    private codeFile() {
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
    import * as Elemento from "/${runtimeFileName}"
    import ${this.app.codeName} from "/${this.codeFileName}"

    Elemento.run(${this.app.codeName})
</script>

</body>
</html>
`
    }
}

