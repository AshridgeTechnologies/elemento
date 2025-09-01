import ServerApp from '../model/ServerApp'
import FunctionDef from '../model/FunctionDef'
import ServerAppParser from './ServerAppParser'
import Element from '../model/Element'
import {ExprType} from './Types'
import {isTruthy} from '../util/helpers'
import {convertAstToValidJavaScript, indent, objectLiteral, printAst, quote, StateInitializer, topoSort} from './generatorHelpers'
import TypesGenerator from './TypesGenerator'
import Project from '../model/Project'
import TinyBaseServerDataStore from '../model/TinyBaseServerDataStore'

const indentLevel1 = '    '

export function generateServerApp(app:ServerApp, project: Project) {
    return new ServerAppGenerator(app, project).output()
}

export default class ServerAppGenerator {
    private parser
    private typesGenerator

    constructor(private readonly app: ServerApp, private readonly project: Project) {
        this.parser = new ServerAppParser(app)
        this.typesGenerator = new TypesGenerator(project)
    }

    output() {
        const serverApp = this.serverApp()

        return {
            files: [serverApp],
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
        return this.app.elementArray().filter( el => this.parser.allComponentIdentifiers().includes(el.kind))
    }

    private componentExpression(element: Element): string {
        const propertyExprEntries = this.project.propertyDefsOf(element).filter( ({state}) => state ).map(def => {
            const expr = this.getExpr(element, def.name)
            return [def.name, expr]
        }).filter(([, expr]) => !!expr)
        const propertyExprs = Object.fromEntries(propertyExprEntries)
        const modelProperties = (() => {
            if (element.kind === 'CloudflareDataStore') {
                return {collections: `"${(element as any).collections?.replace(/\n/g, '\\n')}"`, database: `env.${element.codeName}`}
            }
            if (element.kind === 'TinyBaseServerDataStore') {
                const store = element as TinyBaseServerDataStore
                const databaseName = propertyExprs['databaseName']
                return {collections: `"${store.collections?.replace(/\n/g, '\\n')}"`, durableObject: `env.${element.codeName}`, databaseName}
            }
            return propertyExprs
        })()

        return `new ${element.kind}(${objectLiteral(modelProperties)})`
    }

    private generateComponents = () => {
        const components = this.components()
        const isComponentName = (name: string) => components.find(comp => comp.codeName === name)
        const componentEntries = components.map( (el): StateInitializer => {
            const entry = this.componentExpression(el)
            const identifiers = this.parser.elementIdentifiers(el.id)
            const componentIdentifiersUsed = identifiers.filter(isComponentName)
            return [el, entry, componentIdentifiersUsed]
        }).filter( ([,expr]) => !!expr )
        return topoSort(componentEntries).map(([el, expr]) => {
            return `const ${el.codeName} = ${expr}`
        }).join('\n')
    }

    public serverApp() {
        const generateFunction = (fn: FunctionDef) => {
            const paramList = fn.inputs.join(', ')
            const exprType = fn.action ? 'action' : 'multilineExpression'//'singleExpression'
            const expr = this.getExpr(fn, 'calculation', exprType)
            const functionBody = fn.action || fn.javascript ? expr : `${expr}`
            return `async function ${fn.codeName}(${paramList}) {
${indent(functionBody ?? '', indentLevel1)}
}`
        }

        const generateFunctionMetadata = (fn: FunctionDef) => {
            return `{func: ${fn.codeName}, update: ${!!fn.action}, argNames: [${fn.inputs.map(quote).join(', ')}]}`
        }

        const globalFunctionNames = this.parser.allGlobalFunctionIdentifiers()
        const appFunctionNames = this.parser.allAppFunctionIdentifiers()
        const componentNames = this.parser.allComponentIdentifiers()
        const {files: typesFiles, typesClassNames} = this.typesGenerator.output()

        const hasGlobalFunctions = !!globalFunctionNames.length
        const hasAppFunctions = !!appFunctionNames.length
        const hasComponents = !!componentNames.length
        const hasTypes = !!typesFiles.length

        const imports = [
            `import * as serverRuntime from './serverRuntime.mjs'`,
            `const {runtimeFunctions} = serverRuntime`,
            hasGlobalFunctions && `const {globalFunctions} = serverRuntime`,
            hasAppFunctions && `const {appFunctions} = serverRuntime`,
            hasComponents && `const {components} = serverRuntime`,
            hasTypes && `const {types} = serverRuntime`,
        ].filter(isTruthy).join('\n')

        const globalImports = hasGlobalFunctions && `const {${globalFunctionNames.join(', ')}} = globalFunctions`
        const appFunctionImports = hasAppFunctions && `const {${appFunctionNames.join(', ')}} = appFunctions`
        const componentImports = hasComponents && `const {${componentNames.join(', ')}} = components`
        const typesConstants = hasTypes && `const {${typesClassNames.join(', ')}} = types`

        const importedDeclarations = [globalImports, appFunctionImports, componentImports, typesConstants].filter(isTruthy).join('\n')

        const componentDeclarations = this.generateComponents()
        const functionDeclarations = this.functions().map(generateFunction).join('\n\n')
        const typeDeclarations = typesFiles.map(f => `// ${f.name}\n${f.contents}`).join('\n')
        const appFactoryDeclaration = `const ${this.app.codeName} = (user, env, ctx) => {

function CurrentUser() { return runtimeFunctions.asCurrentUser(user) }

${componentDeclarations}
${functionDeclarations}

return {
${this.publicFunctions().map(f => `    ${f.codeName}: ${generateFunctionMetadata(f)}`).join(',\n')}
}
}`
        const exportDeclaration = `export default ${this.app.codeName}`

        const serverAppCode = [
            imports,
            importedDeclarations,
            typeDeclarations,
            appFactoryDeclaration,
            exportDeclaration
        ].filter(isTruthy).join('\n\n')

        return {name: `${this.app.codeName}.mjs`, contents: serverAppCode}
    }

    private getExpr(element: Element, propertyName: string, exprType: ExprType = 'singleExpression') {
        const isKnownSyncUserFunction = (fnName: string) => false

        const isSingleExpr = exprType === 'singleExpression'
        const errorMessage = this.parser.propertyError(element.id, propertyName)
        if (errorMessage && !errorMessage.startsWith('Incomplete item')) {
            const returnStmt = isSingleExpr ? '' : 'return '
            return `${returnStmt}runtimeFunctions.codeGenerationError(\`${this.parser.getExpression(element.id, propertyName)}\`, '${errorMessage}')`
        }

        const ast = this.parser.getAst(element.id, propertyName)
        if (ast === undefined) {
            return isSingleExpr ? undefined : 'return undefined'
        }

        const isJavascriptFunctionBody = element.kind === 'Function' && propertyName === 'calculation' && (element as FunctionDef).javascript
        if (!isJavascriptFunctionBody) {
            convertAstToValidJavaScript(ast, exprType, ['action', 'multilineExpression'], isKnownSyncUserFunction);
        }

        const exprCode = printAst(ast)
        switch (exprType) {
            case 'singleExpression':
                return exprCode
            case 'action':
                return `${exprCode}`
            case 'multilineExpression': {
                return `${exprCode}`
            }
        }
    }
}
