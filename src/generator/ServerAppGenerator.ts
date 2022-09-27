import ServerApp from '../model/ServerApp'
import FunctionDef from '../model/FunctionDef'
import ServerAppParser from './ServerAppParser'
import Element from '../model/Element'
import {ExprType} from './Types'
import {last} from 'ramda'
import {print, types} from 'recast'
import {visit} from 'ast-types'

const indent = (codeBlock: string, indent: string) => codeBlock.split('\n').map( line => indent + line).join('\n')
const indentLevel2 = '        '

export default class ServerAppGenerator {
    private parser
    constructor(public app: ServerApp) {
        this.parser = new ServerAppParser(app)
    }

    output() {
        const serverApp = this.serverApp()
        const expressApp = this.expressApp()
        const cloudFunction = this.cloudFunction()
        const packageJson = this.packageJson()

        return {
            files: [serverApp, expressApp, cloudFunction, packageJson]
        }
    }
    private functions() {
        return this.app.elementArray() as FunctionDef[]
    }

    private serverApp() {
        const generateFunction = (fn: FunctionDef) => {
            const paramList = fn.inputs.join(', ')
            const expr = this.getExpr(fn, 'calculation')
            return `async function ${fn.name}(${paramList}) {
    return ${expr}
}`
        }
        let functionDeclarations = this.functions().map(generateFunction).join('\n\n')
        let exportDeclaration = `const ${this.app.codeName} = {
${this.functions().map(f => `    ${f.name}: ${f.name}`).join(',\n')}
}

export default ${this.app.codeName}`
        const serverAppCode = functionDeclarations + '\n\n' + exportDeclaration
        return {name: `${this.app.codeName}.js`, content: serverAppCode}
    }

    private expressApp() {
        const generateRoute = (fn: FunctionDef) => {
            const paramList = fn.inputs.join(', ')
            const expr = this.getExpr(fn, 'calculation')
            const pathPrefix = this.app.codeName.toLowerCase()
            return `app.get('/${pathPrefix}/${fn.name}', async (req, res, next) => {
    const {${paramList}} = req.query
    try {
        res.json(await baseApp.${fn.name}(${paramList}))
    } catch(err) { next(err) }
})`
        }

        const imports = `import express from 'express'\nimport baseApp from './${this.app.codeName}.js'`
        const appDeclaration = `const app = express()`
        const useTrace = `app.use( (req, res, next) => {
    console.log(req.method, req.url)
    next()
})`
        const appConfigurations = this.functions().map(generateRoute)
        const theExports = `export default app`
        const code = [
            imports, appDeclaration, useTrace, ...appConfigurations, theExports
        ].join('\n\n')

        return {name: `${this.app.codeName}Express.js`, content: code}
    }

    private cloudFunction() {
        const imports = `import {onRequest} from 'firebase-functions/v2/https'\nimport app from './${this.app.codeName}Express.js'`
        const theExports = `export const ${this.app.codeName.toLowerCase()} = onRequest(app)`
        const code = [
            imports, theExports
        ].join('\n\n')

        return {name: `index.js`, content: code}

    }

    private packageJson() {
        return {name: `package.json`, content: `{
    "type": "module",
    "dependencies": {
      "express": "^4.18.1",
      "firebase-functions": "^3.23.0"
    }
}`}

    }

    private getExpr(element: Element, propertyName: string, exprType: ExprType = 'singleExpression') {
        function isShorthandProperty(node: any) {
            return node.shorthand
        }

        function addReturnStatement(ast: any) {
            const bodyStatements = ast.program.body as any[]
            const lastStatement = last(bodyStatements)
            const b = types.builders
            ast.program.body[bodyStatements.length - 1] = b.returnStatement(lastStatement.expression)
        }

        // const errorMessage = this.parser.propertyError(element.id, propertyName)
        // if (errorMessage && !errorMessage.startsWith('Incomplete item')) {
        //     return `Elemento.codeGenerationError(\`${this.parser.getExpression(element.id, propertyName)}\`, '${errorMessage}')`
        // }

        const ast = this.parser.getAst(element.id, propertyName)
        // if (ast === undefined) {
        //     return undefined
        // }

        visit(ast, {
            // visitAssignmentExpression(path) {
            //     const node = path.value
            //     node.type = 'BinaryExpression'
            //     node.operator = '=='
            //     this.traverse(path)
            // },
            //
            // visitProperty(path) {
            //     const node = path.value
            //     if (isShorthandProperty(node)) {
            //         node.value.name = 'undefined'
            //     }
            //     this.traverse(path)
            // },

            visitCallExpression(path) {
                const callExpr = path.value
                const b = types.builders

                // const functionName = node.callee.name
                // const argsToTransform = functionArgIndexes[functionName as keyof typeof functionArgIndexes]
                // argsToTransform?.forEach(index => {
                //     const bodyExpr = node.arguments[index]
                //     const b = types.builders
                //     node.arguments[index] = b.arrowFunctionExpression([b.identifier('$item')], bodyExpr)
                // })
                const awaitExpr = b.awaitExpression(callExpr)
                path.replace(awaitExpr)

                this.traverse(path.get('argument')) // start one level down so don't parse this node again
            }
        })

        if (exprType === 'multilineExpression') {
            addReturnStatement(ast)
        }

        const exprCode = print(ast).code.replace(/;$/, '')
        switch (exprType) {
            case 'singleExpression':
                return exprCode
            case 'action':
                return `() => {${exprCode}}`
            case 'multilineExpression': {
                return `{\n${indent(exprCode, indentLevel2)}\n    }`
            }
        }
    }

}