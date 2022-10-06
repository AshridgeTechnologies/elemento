import ServerApp from '../model/ServerApp'
import FunctionDef from '../model/FunctionDef'
import ServerAppParser from './ServerAppParser'
import Element from '../model/Element'
import {ExprType} from './Types'
import {last} from 'ramda'
import {print, types} from 'recast'
import {visit} from 'ast-types'
import {isTruthy} from '../util/helpers'
import {objectLiteral, StateEntry, topoSort} from './generatorHelpers'
import {useContext} from 'react'

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
        return this.app.elementArray().filter( el => el.kind === 'Function') as FunctionDef[]
    }

    private components() {
        return this.app.elementArray().filter( el => this.parser.allComponentIdentifiers().includes(el.kind)) as FunctionDef[]
    }

    private componentExpression(element: Element): string {
        const propertyExprs = element.propertyDefs.filter( ({state}) => state ).map(def => {
            const expr = this.getExpr(element, def.name)
            return [def.name, expr]
        }).filter(([, expr]) => !!expr)
        const modelProperties =  Object.fromEntries(propertyExprs)

        return `new ${element.kind}(${objectLiteral(modelProperties)})`
    }

    private generateComponents = () => {
        const components = this.components()
        const isComponentName = (name: string) => components.find(comp => comp.codeName === name)
        const componentEntries = components.map( (el): StateEntry => {
            const entry = this.componentExpression(el)
            const identifiers = this.parser.elementIdentifiers(el.id)
            const componentIdentifiersUsed = identifiers.filter(isComponentName)
            return [el.codeName, entry, componentIdentifiersUsed]
        }).filter( ([,expr]) => !!expr )
        return topoSort(componentEntries).map(([name, expr]) => {
            return `const ${name} = ${expr}`
        }).join('\n')
    }

    private serverApp() {
        const generateFunction = (fn: FunctionDef) => {
            const paramList = fn.inputs.join(', ')
            const expr = this.getExpr(fn, 'calculation')
            return `async function ${fn.codeName}(${paramList}) {
    return ${expr}
}`
        }

        const globalFunctionNames = this.parser.allGlobalFunctionIdentifiers()
        const appFunctionNames = this.parser.allAppFunctionIdentifiers()
        const componentNames = this.parser.allComponentIdentifiers()

        const hasGlobalFunctions = !!globalFunctionNames.length
        const hasAppFunctions = !!appFunctionNames.length
        const hasComponents = !!componentNames.length

        const imports = [
            hasGlobalFunctions && `import {globalFunctions} from './serverRuntime.js'`,
            hasAppFunctions && `import {appFunctions} from './serverRuntime.js'`,
            hasComponents && `import {components} from './serverRuntime.js'`,
        ].filter(isTruthy).join('\n')

        const globalImports = hasGlobalFunctions && `const {${globalFunctionNames.join(', ')}} = globalFunctions`
        const appFunctionImports = hasAppFunctions && `const {${appFunctionNames.join(', ')}} = appFunctions`
        const componentImports = hasComponents && `const {${componentNames.join(', ')}} = components`
        const importedDeclarations = [globalImports, appFunctionImports, componentImports].filter(isTruthy).join('\n')

        const componentDeclarations = this.generateComponents()
        const functionDeclarations = this.functions().map(generateFunction).join('\n\n')
        const exportDeclaration = `const ${this.app.codeName} = {
${this.functions().map(f => `    ${f.codeName}: ${f.codeName}`).join(',\n')}
}

export default ${this.app.codeName}`

        const serverAppCode = [
            imports,
            importedDeclarations,
            componentDeclarations,
            functionDeclarations,
            exportDeclaration
        ].filter(isTruthy).join('\n\n')

        return {name: `${this.app.codeName}.js`, content: serverAppCode}
    }

    private expressApp() {
        const generateRoute = (fn: FunctionDef) => {
            const paramList = fn.inputs.join(', ')
            const pathPrefix = this.app.codeName.toLowerCase()
            const method = fn.action ? 'post' : 'get'
            const paramsExpr = fn.action ? 'req.body' : 'parseQueryParams(req)'
            return `app.${method}('/${pathPrefix}/${fn.codeName}', async (req, res, next) => {
    const {${paramList}} = ${paramsExpr}
    try {
        res.json(await baseApp.${fn.codeName}(${paramList}))
    } catch(err) { next(err) }
})`
        }

        const imports = [
            `import express from 'express'`,
            `import {expressUtils} from './serverRuntime.js'`,
            `import baseApp from './${this.app.codeName}.js'`,
        ].join('\n')
        const importDeclarations = `const {checkUser, parseQueryParams} = expressUtils`
        const appDeclaration = `const app = express()`
        const useCheckUser = `app.use(checkUser)`
        const useJson = `app.use(express.json())`
        const useCalls = [useCheckUser, useJson].join('\n')
        const appConfigurations = this.functions().map(generateRoute)
        const theExports = `export default app`
        const code = [
            imports, importDeclarations, appDeclaration, useCalls, ...appConfigurations, theExports
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
      "firebase-functions": "^3.23.0",
      "firebase-admin": "^11.0.1"
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
        const globalFunctions = this.parser.allGlobalFunctionIdentifiers()

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

                const knownSync = globalFunctions.includes(callExpr.callee.name)
                if (!knownSync) {
                    const awaitExpr = b.awaitExpression(callExpr)
                    path.replace(awaitExpr)
                }

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