import ServerApp from '../model/ServerApp'
import FunctionDef from '../model/FunctionDef'
import ServerAppParser from './ServerAppParser'
import Element from '../model/Element'
import {functionArgIndexes} from '../serverRuntime/globalFunctions'
import {ExprType} from './Types'
import {last} from 'ramda'
import {print, types} from 'recast'
import {visit} from 'ast-types'
import {isTruthy} from '../util/helpers'
import {objectLiteral, quote, StateEntry, topoSort} from './generatorHelpers'

const indent = (codeBlock: string, indent: string) => codeBlock.split('\n').map( line => indent + line).join('\n')
const indentLevel2 = '        '

export function generateServerApp(app:ServerApp) {
    return new ServerAppGenerator(app).output()
}

export default class ServerAppGenerator {
    private parser
    constructor(public app:ServerApp) {
        this.parser = new ServerAppParser(app)
    }

    output() {
        const serverApp = this.serverApp()
        const expressApp = this.expressApp()

        return {
            files: [serverApp, expressApp],
            errors: this.parser.allErrors(),
        }
    }

    private functions() {
        return this.app.elementArray().filter( el => el.kind === 'Function') as FunctionDef[]
    }

    private publicFunctions() {
        return this.functions().filter( el => !el.private )
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

    public serverApp() {
        const generateFunction = (fn: FunctionDef) => {
            const paramList = fn.inputs.join(', ')
            const exprType = fn.action ? 'action' : 'singleExpression'
            const expr = this.getExpr(fn, 'calculation', exprType)
            const functionBody = fn.action ? expr : `return ${expr}`
            return `async function ${fn.codeName}(${paramList}) {
    ${functionBody}
}`
        }

        const generateFunctionMetadata = (fn: FunctionDef) => {
            return `{func: ${fn.codeName}, update: ${!!fn.action}, argNames: [${fn.inputs.map(quote).join(', ')}]}`
        }

        const globalFunctionNames = this.parser.allGlobalFunctionIdentifiers()
        const appFunctionNames = this.parser.allAppFunctionIdentifiers()
        const componentNames = this.parser.allComponentIdentifiers()

        const hasGlobalFunctions = !!globalFunctionNames.length
        const hasAppFunctions = !!appFunctionNames.length
        const hasComponents = !!componentNames.length

        const imports = [
            `import {runtimeFunctions} from './serverRuntime.cjs'`,
            hasGlobalFunctions && `import {globalFunctions} from './serverRuntime.cjs'`,
            hasAppFunctions && `import {appFunctions} from './serverRuntime.cjs'`,
            hasComponents && `import {components} from './serverRuntime.cjs'`,
        ].filter(isTruthy).join('\n')

        const globalImports = hasGlobalFunctions && `const {${globalFunctionNames.join(', ')}} = globalFunctions`
        const appFunctionImports = hasAppFunctions && `const {${appFunctionNames.join(', ')}} = appFunctions`
        const componentImports = hasComponents && `const {${componentNames.join(', ')}} = components`
        const importedDeclarations = [globalImports, appFunctionImports, componentImports].filter(isTruthy).join('\n')

        const componentDeclarations = this.generateComponents()
        const functionDeclarations = this.functions().map(generateFunction).join('\n\n')
        const appFactoryDeclaration = `const ${this.app.codeName} = (user) => {

function CurrentUser() { return runtimeFunctions.asCurrentUser(user) }

${functionDeclarations}

return {
${this.publicFunctions().map(f => `    ${f.codeName}: ${generateFunctionMetadata(f)}`).join(',\n')}
}
}`
        const exportDeclaration = `export default ${this.app.codeName}`

        const serverAppCode = [
            imports,
            importedDeclarations,
            componentDeclarations,
            appFactoryDeclaration,
            exportDeclaration
        ].filter(isTruthy).join('\n\n')

        return {name: `${this.app.codeName}.mjs`, contents: serverAppCode}
    }

    private expressApp() {
        const imports = [
            `import {expressApp} from './serverRuntime.cjs'`,
            `import baseAppFactory from './${this.app.codeName}.mjs'`,
        ].join('\n')
        const appDeclaration = `const app = expressApp(baseAppFactory)`
        const theExports = `export default app`
        const code = [
            imports, appDeclaration, theExports
        ].join('\n\n')

        return {name: `${this.app.codeName}Express.js`, contents: code}
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

        const errorMessage = this.parser.propertyError(element.id, propertyName)
        if (errorMessage && !errorMessage.startsWith('Incomplete item')) {
            return `runtimeFunctions.codeGenerationError(\`${this.parser.getExpression(element.id, propertyName)}\`, '${errorMessage}')`
        }

        const ast = this.parser.getAst(element.id, propertyName)
        if (ast === undefined) {
            return undefined
        }
        const globalFunctions = this.parser.allGlobalFunctionIdentifiers()

        visit(ast, {
            visitAssignmentExpression(path) {
                const node = path.value
                node.type = 'BinaryExpression'
                node.operator = '=='
                this.traverse(path)
            },

            visitProperty(path) {
                const node = path.value
                if (isShorthandProperty(node)) {
                    node.value.name = 'undefined'
                }
                this.traverse(path)
            },

            visitCallExpression(path) {
                const callExpr = path.value
                const b = types.builders

                const functionName = callExpr.callee.name
                const argsToTransform = functionArgIndexes[functionName as keyof typeof functionArgIndexes]
                argsToTransform?.forEach(index => {
                    const bodyExpr = callExpr.arguments[index]
                    const b = types.builders
                    callExpr.arguments[index] = b.arrowFunctionExpression([b.identifier('$item')], bodyExpr)
                })

                const knownSync = globalFunctions.includes(callExpr.callee.name)
                if (!knownSync) {
                    const awaitExpr = b.awaitExpression(callExpr)
                    path.replace(awaitExpr)
                    this.traverse(path.get('argument')) // start one level down so don't parse this node again
                } else {
                    this.traverse(path)
                }
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
                return `${exprCode}`
            case 'multilineExpression': {
                return `{\n${indent(exprCode, indentLevel2)}\n    }`
            }
        }
    }

}
