import Project, {TOOLS_ID} from '../model/Project'
import Generator, {generate} from './Generator'
import App from '../model/App'
import {ASSET_DIR} from '../shared/constants'
import {AllErrors} from "./Types"
import Tool from '../model/Tool'
import {flatten, pickBy} from 'ramda'
import ServerApp from '../model/ServerApp'
import {generateServerApp} from './ServerAppGenerator'
import CloudflareDataStore from '../model/CloudflareDataStore'
import TinyBaseDataStore from '../model/TinyBaseDataStore'
import {flatMap} from 'lodash'

export type FileContents = Uint8Array | string
export interface ProjectLoader {
    getProject(): Project
}

export interface RuntimeLoader {
    clientRuntime(): Promise<string>
    serverRuntime(): Promise<string>
}

export interface FileLoader {
    exists(dirPath: string): Promise<boolean>
    listFiles(dirPath: string): Promise<string[]>
    readFile(filePath: string): Promise<FileContents>
}

export interface FileWriter {
    writeFile(filepath: string, contents: FileContents): Promise<void>
}

export interface CombinedFileWriter {
    writeFiles(files: {[filepath: string]:FileContents}): Promise<void>
}

export type Properties = {
    projectLoader: ProjectLoader,
    fileLoader: FileLoader,
    runtimeLoader: RuntimeLoader,
    rootFileWriter: FileWriter,
    clientFileWriter: FileWriter,
    toolFileWriter: FileWriter,
    serverFileWriter: FileWriter,
}

type FileSet = { [name: string]: string }
class FileHolder {
    private files: FileSet = {}
    private updatedFiles: { [name: string]: boolean } = {}

    storeFile(name: string, content: string) {
        if (this.files[name] !== content) {
            this.files[name] = content
            this.updatedFiles[name] = true
        }
    }

    getFiles(): FileSet {
        return {...this.files}
    }

    getUpdatedFiles(): FileSet {
        return pickBy( (_, key) => this.updatedFiles[key], this.files)
    }

    writeComplete(name: string) {
        this.updatedFiles[name] = false
    }

}

export default class ProjectBuilder {
    private generatedRootFiles = new FileHolder()
    private generatedClientCode = new FileHolder()
    private generatedToolCode = new FileHolder()
    private generatedServerCode = new FileHolder()
    private generatedErrors: AllErrors = {}

    constructor(private readonly props: Properties) {
    }

    async build() {
        await this.buildProjectFiles()
        await Promise.all([this.writeProjectFiles(), this.copyAssetFiles()])
    }

    async updateAssetFile(path: string) {
        await this.copyAssetFile(path)
    }

    get code() { return {...this.generatedClientCode.getFiles(), ...this.generatedServerCode.getFiles()}}
    get errors() { return {...this.generatedErrors}}

    private get project() { return this.props.projectLoader.getProject() }
    private get syncedTinyBaseStores() { return this.project.findElementsBy(el => el instanceof TinyBaseDataStore && el.syncWithServer ) as TinyBaseDataStore[] }
    private get runtimeLoader() { return this.props.runtimeLoader }

    async writeProjectFiles() {
        const writeFiles = (fileHolder: FileHolder, fileWriter: FileWriter) => {
            const files = fileHolder.getUpdatedFiles()
            return Object.entries(files).map(([name, contents]) => {
                return fileWriter.writeFile(name, contents).then( ()=> fileHolder.writeComplete(name))
            })
        }

        const rootFileWritePromises = writeFiles(this.generatedRootFiles, this.props.rootFileWriter)
        const clientFileWritePromises = writeFiles(this.generatedClientCode, this.props.clientFileWriter)
        const toolFileWritePromises = writeFiles(this.generatedToolCode, this.props.toolFileWriter)
        const serverFileWritePromises = writeFiles(this.generatedServerCode, this.props.serverFileWriter)
        await Promise.all([...rootFileWritePromises, ...clientFileWritePromises, ...toolFileWritePromises, ...serverFileWritePromises])
    }

    async buildProjectFiles() {
        this.generatedErrors = {}
        const project = this.project
        const apps = project.findChildElements(App)
        this.buildRootFiles()
        apps.forEach(app => this.buildClientAppFiles(app))
        const tools: Tool[] = project.findElement(TOOLS_ID)?.elements?.filter( el => el.kind === 'Tool' ) as Tool[] ?? []
        tools.forEach(tool => this.buildToolAppFiles(tool))
        await this.buildServerAppFiles()
    }

    private buildRootFiles() {
        this.generatedRootFiles.storeFile('wrangler.jsonc', this.wranglerConfig())
        this.generatedRootFiles.storeFile('package.json', this.packageJson(this.project.codeName))
        this.generatedRootFiles.storeFile('index.js', this.indexJs())
        this.generatedRootFiles.storeFile('auth.html', this.authHtml())
    }

    private buildClientAppFiles(app: App) {
        const {code, html, errors} = generate(app, this.project)
        const appName = app.codeName + '/' + app.codeName + '.js'
        const htmlRunnerFileName = app.codeName + '/' + 'index.html'
        this.generatedClientCode.storeFile(appName, code)
        this.generatedClientCode.storeFile(htmlRunnerFileName, html)
        Object.assign(this.generatedErrors, errors)
    }

    private buildToolAppFiles(tool: Tool) {
        const {code, html, errors} = generate(tool, this.project)
        const toolName = tool.codeName + '/' + tool.codeName + '.js'
        const htmlRunnerFileName = tool.codeName + '/' + 'index.html'
        this.generatedToolCode.storeFile(toolName, code)
        this.generatedToolCode.storeFile(htmlRunnerFileName, html)
        Object.assign(this.generatedErrors, errors)
    }

    private async buildServerAppFiles() {
        const serverApps = this.project.findChildElements(ServerApp)
        const serverAppOutputs = serverApps.map(app => generateServerApp(app, this.project))
        const files = flatten(serverAppOutputs.map(({files}) => files))
        const errors = serverAppOutputs.reduce((acc, output) => ({...acc, ...output.errors}), {})

        files.forEach( ({name, contents}) => this.generatedServerCode.storeFile(name, contents) )
        Object.assign(this.generatedErrors, errors)
        this.generatedServerCode.storeFile('serverRuntime.mjs', await this.runtimeLoader.serverRuntime())
        this.generatedServerCode.storeFile('status.mjs', this.statusJs())
    }

    private async copyAssetFile(filename: string) {
        const {fileLoader, clientFileWriter} = this.props
        const filepath = `${ASSET_DIR}/${filename}`
        const fileContents = await fileLoader.readFile(filepath)
        await clientFileWriter.writeFile(filepath, fileContents)
    }

    private async copyAssetFiles() {
        const filesDirExists = await this.props.fileLoader.exists(ASSET_DIR)
        if (filesDirExists) {
            const files = await this.props.fileLoader.listFiles(ASSET_DIR)
            await Promise.all(files.map( f => this.copyAssetFile(f) ))
        }
    }

    private wranglerConfig() {
        const appNames = this.project.findChildElements('App').map( el => el.codeName)
        const projectName = this.project.codeName
        const projectConfig = this.project.configuration

        const {authStoreId} = projectConfig
        const d1DatabaseBindings = this.project.findElementsBy( el => el.kind === 'CloudflareDataStore').map( el => {
            const cfds = el as CloudflareDataStore
            return `
        {
            "binding": "${cfds.codeName}",
            "database_name": "${cfds.databaseName}",
            "database_id": "${cfds.databaseId}"
        }`
        }).join(',\n')

        const durableObjectBindings = this.syncedTinyBaseStores.map(el => `
        {
            "name": "${el.codeName}",
            "class_name": "${el.codeName}"
        }`).join(',\n')
        const migrationClasses = this.syncedTinyBaseStores.map( el => `"${el.codeName}"`).join(', ')

        return `
{
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "${projectName.toLowerCase()}",
    "main": "index.js",
    "compatibility_date": "2025-04-02",
    "observability": {
        "enabled": true
    },
    "compatibility_flags": [
        "nodejs_compat"
    ],
     "vars": { "APPS": "${appNames.join(',')}" },
    "assets": { "directory": "./client", "binding": "ASSETS" },
    "kv_namespaces": [
    {
      "binding": "auth",
      "id": "${authStoreId}"
    }
  ],
    "d1_databases": [
${d1DatabaseBindings}
    ],
    
  "durable_objects": {
    "bindings": [
${durableObjectBindings}    
    ]
  },

  "migrations": [
    {
      "tag": "v1", "new_sqlite_classes": [${migrationClasses}]
    }
  ]
}
`.trimStart()
    }

    private packageJson(projectName: string) {
        return `
{
	"name": "${projectName}",
	"version": "0.0.0",
	"private": true,
	"scripts": {
		"deploy": "wrangler deploy",
		"dev": "wrangler dev",
		"start": "wrangler dev"
	},
	"devDependencies": {
		"wrangler": "^4.12.0"
	}
}
`.trimStart()
    }

    private allDurableObjectClasses() {
        const apps = this.project.findChildElements(App)
        return flatMap(apps.map( app => new Generator(app, this.project).generateDurableObjectClasses()))
    }

    private indexJs() {
        const serverAppNames = this.project.findElementsBy( el => el.kind === 'ServerApp').map( el => el.codeName )
        const serverImports = serverAppNames.map( name => `import ${name} from './server/${name}.mjs'`).join('\n')
        const serverList = serverAppNames.join(', ')
        const doClasses = this.allDurableObjectClasses().join('\n\n')

        return `
import {cloudflareFetch, TinyBaseFullSyncDurableObject, TinyBaseAuthSyncDurableObject} from './server/serverRuntime.mjs'
import status from './server/status.mjs'
${serverImports}
const serverApps = {status, ${serverList}}

${doClasses}

export default {
  async fetch(request, env, ctx) {
        return cloudflareFetch(request, env, ctx, serverApps)
  }
}
`.trimStart()
    }

    private statusJs() {
        const {serverBuildVersion} = this.project
        return `
const status = () => {

async function Info() {
    return { serverBuildVersion: ${serverBuildVersion ? `'${serverBuildVersion}'` : null } }
}

return {
    Info: {func: Info, update: false, argNames: []}
}
}

export default status
`.trimStart()
    }

    private authHtml() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="initial-scale=1, width=device-width" />
  <title>Login</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link id="web-font-link" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
  <style>
    body { margin: 0; padding: 0}
    #main { height: 100vh; width: 100vw; margin: 0 }
  </style>
</head>
<body>
<script type="module">
    const elementoRuntimeHost = (location.host.match(/^(localhost:|elemento-apps)/)) ? location.origin : 'https://elemento.online'
    window.elementoRuntimeUrl = elementoRuntimeHost + '/lib/runtime.js'
    import(window.elementoRuntimeUrl).then( runtime => runtime.runAppFromWindowUrl() )
</script>
</body>
</html>
`.trimStart()
    }
}
