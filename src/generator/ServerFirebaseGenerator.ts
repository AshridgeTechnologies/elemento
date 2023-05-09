import ServerApp from '../model/ServerApp'
import {flatten} from 'ramda'
import Project from '../model/Project'
import {generateServerApp} from './ServerAppGenerator'

export default class ServerFirebaseGenerator {
    constructor(public project: Project) {}

    output() {
        const serverAppOutputs = this.serverApps.map( generateServerApp )
        const serverAppFiles = flatten(serverAppOutputs.map( ({files}) => files))
        const cloudFunction = this.cloudFunction()
        const packageJson = this.packageJson()
        const errors = serverAppOutputs.reduce( (acc, output) => ({...acc, ...output.errors}), {})

        return {
            files: [...serverAppFiles, cloudFunction, packageJson],
            errors
        }
    }

    private get serverApps() { return this.project.findChildElements(ServerApp) }

    private cloudFunction() {
        const imports = [`import {onRequest} from 'firebase-functions/v2/https'`,
            ...this.serverApps.map( app => `import ${app.codeName}Express from './${app.codeName}Express.js'` )].join('\n')
        const theExports = this.serverApps.map( app => `export const ${app.codeName.toLowerCase()} = onRequest(${app.codeName}Express)`).join('\n')
        const code = [
            imports, theExports
        ].join('\n\n')

        return {name: `index.js`, contents: code}
    }

    private packageJson() {
        return {name: `package.json`, contents: `{
  "type": "module",
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "express": "^4.18.1",
    "firebase-functions": "^3.23.0",
    "firebase-admin": "^11.0.1"
  },
  "private": true
}`}
    }
}
