import {parse, prettyPrint, print, types} from 'recast'
import {visit,} from 'ast-types'

import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'
import Element from '../model/Element'
import {functionArgIndexes} from '../runtime/globalFunctions'
import UnsupportedValueError from '../util/UnsupportedValueError'
import List from '../model/List'
import FunctionDef from '../model/FunctionDef'
import {flatten, identity, last, omit} from 'ramda'
import Parser from './Parser'
import {ExprType, GeneratorOutput, ListItem, runtimeElementName, runtimeFileName} from './Types'
import {notBlank, notEmpty, trimParens} from '../util/helpers'
import {
    allElements,
    DefinedFunction, isAppLike,
    objectLiteral,
    objectLiteralEntries,
    quote,
    StateEntry,
    topoSort,
    valueLiteral
} from './generatorHelpers'
import Project from '../model/Project'
import ServerAppConnector from '../model/ServerAppConnector'
import ServerApp from '../model/ServerApp'
import {EventActionPropertyDef, PropertyDef} from '../model/Types'
import TypesGenerator from './TypesGenerator'
import FunctionImport from "../model/FunctionImport";
import {ASSET_DIR} from "../shared/constants";
import Form from '../model/Form'
import Tool from '../model/Tool'

type FunctionCollector = {add(s: string): void}

const indent = (codeBlock: string, indent: string) => codeBlock.split('\n').map( line => indent + line).join('\n')
const indentLevel2 = '        '
const indentLevel3 = '            '

const isActionProperty = (def: PropertyDef) => (def.type as EventActionPropertyDef).type === 'Action'

export const DEFAULT_IMPORTS = [
    `const runtimeUrl = \`\${window.location.origin}/lib/runtime.js\``,
    `const Elemento = await import(runtimeUrl)`,
    `const {React} = Elemento`
]

export function generate(app: App, project: Project, imports: string[] = DEFAULT_IMPORTS) {
    return new Generator(app, project, imports).output()
}
export default class Generator {
    private parser
    private typesGenerator

    constructor(public app: App | Tool, private project: Project, public imports: string[] = DEFAULT_IMPORTS) {
        this.parser = new Parser(app, project)
        this.parser.parseComponent(project.dataTypesContainer)
        this.parser.parseComponent(app)
        this.typesGenerator = new TypesGenerator(project)
    }

    static prettyPrint(code: string) {
        return prettyPrint(parse(code), {quote: 'single', objectCurlySpacing: false}).code
    }

    output() {
        const {files: typesFiles, typesClassNames} = this.typesGenerator.output()
        const pageFiles = this.app.pages.map(page => ({
            name: `${(page.codeName)}.js`,
            contents: this.generateComponent(this.app, page)
        }))

        const appFileName = this.app.kind === 'App' ? 'appMain.js' : `${this.app.codeName}.js`
        const appFile = {
            name: appFileName,
            contents: this.generateComponent(this.app, this.app)
        }

        const imports = [...this.imports, ...this.generateImports(this.app)].join('\n') + '\n\n'
        const typesConstants = typesFiles.length ? `const {types: {${typesClassNames.join(', ')}}} = Elemento\n\n` : ''
        const dirPrefix = this.app.kind === 'Tool' ? 'tools/' : ''
        return <GeneratorOutput>{
            files: [...typesFiles, ...pageFiles, appFile],
            errors: this.parser.allErrors(),
            get code() {
                return imports + typesConstants + this.files.map(f => `// ${f.name}\n${f.contents}`).join('\n')
            },
            html: this.htmlRunnerFile()
        }
    }

    private generateImports(app: App) {
        const generateImport = ({source, codeName, exportName}: FunctionImport) => {
            const isHttp = source?.match(/^https?:\/\//)
            if (isHttp) {
                const exportNameArg = exportName ? `, '${exportName}'` : ''
                return `const ${codeName} = await importModule('${source}'${exportNameArg})`
            } else {
                const exportNameArg = exportName ? `'${exportName}'` : ''
                const importPath = `../${ASSET_DIR}/${source ?? codeName + '.js'}`
                return `const ${codeName} = await import('${importPath}').then(...importHandlers(${exportNameArg}))`
            }
        }

        const functionImports = app.findChildElements(FunctionImport)
        return functionImports.length ? [`const {importModule, importHandlers} = Elemento`, ...functionImports.map(generateImport)] : []
    }

    private generateComponent(app: App, component: Page | App | Form | ListItem, containingComponent?: Page) {
        const componentIsApp = isAppLike(component)
        const canUseContainerElements = component instanceof ListItem && containingComponent
        const componentIsForm = component instanceof Form
        const topLevelFunctions = new Set<string>()
        const allPages = app.pages
        const allComponentElements = allElements(component, true)
        const allContainerElements = canUseContainerElements ? allElements(containingComponent, true) : []
        const isAppElement = (name: string) => !!app.otherComponents.find( el => el.codeName === name && el.kind !== 'FunctionImport' )
        const isContainerElement = (name: string) => !!allContainerElements.find(el => el.codeName === name )
        const uiElementCode = this.generateComponentCode(component, app, topLevelFunctions)
        const identifiers = this.parser.componentIdentifiers(component.id)

        const appStateFunctionIdentifiers = this.parser.appStateFunctionIdentifiers(component.id)
        const pages = componentIsApp ? `    const pages = {${allPages.map(p => p.codeName).join(', ')}}` : ''
        const appContext = componentIsApp ? `    const {appContext} = props` : ''
        const appStateDeclaration = componentIsApp
            ? `    const app = Elemento.useObjectState('app', new App.State({pages, appContext}))`
            : appStateFunctionIdentifiers.length ? `    const app = Elemento.useGetObjectState('app')` : ''
        const appStateFunctionDeclarations = appStateFunctionIdentifiers.length ? `    const {${appStateFunctionIdentifiers.join(', ')}} = app` : ''
        const componentIdentifiers = this.parser.identifiersOfTypeComponent(component.id).map( comp => comp === 'Tool' ? 'App' : comp)
        const componentDeclarations = componentIdentifiers.length ? `    const {${componentIdentifiers.join(', ')}} = Elemento.components` : ''
        const globalFunctionIdentifiers = this.parser.globalFunctionIdentifiers(component.id)
        const globalDeclarations = globalFunctionIdentifiers.length ? `    const {${globalFunctionIdentifiers.join(', ')}} = Elemento.globalFunctions` : ''
        const appFunctionIdentifiers = this.parser.appFunctionIdentifiers(component.id)
        const appFunctionDeclarations = appFunctionIdentifiers.length ? `    const {${appFunctionIdentifiers.join(', ')}} = Elemento.appFunctions` : ''
        const toolsDeclarations = this.app.kind === 'Tool' ? `    const {Editor, Preview} = Elemento` : ''

        let appLevelDeclarations
        if (!componentIsApp) {
            const appLevelIdentifiers = identifiers.filter(isAppElement)
            appLevelDeclarations = appLevelIdentifiers.map(ident => `    const ${ident} = Elemento.useGetObjectState('app.${ident}')`).join('\n')
        }
        let containerDeclarations
        if (canUseContainerElements) {
            const containerIdentifiers = identifiers.filter(isContainerElement)
            containerDeclarations = containerIdentifiers.map(ident => `    const ${ident} = Elemento.useGetObjectState(parentPathWith('${ident}'))`).join('\n')
        }
        const elementoDeclarations = [componentDeclarations, globalDeclarations, toolsDeclarations, pages, appContext,
            appStateDeclaration, appStateFunctionDeclarations, appFunctionDeclarations, appLevelDeclarations, containerDeclarations].filter(d => d !== '').join('\n').trimEnd()

        const actionHandler = (el: Element, def: PropertyDef) => {
            const actionDef = def.type as EventActionPropertyDef
            const functionCode = this.getExpr(el, def.name, 'action', actionDef.argumentNames)
            const voidReturnFunctionCode = functionCode?.startsWith('async ') ? `() => {\n    const doAction = ${functionCode}\n    doAction()\n    }` : functionCode
            const functionName = `${el.codeName}_${def.name}`
            const identifiers = this.parser.statePropertyIdentifiers(el.id, def.name)
            const dependencies = identifiers.filter(id => id !== el.codeName && (isStatefulComponentName(id) || (componentIsForm && id === '$form')))
             return functionCode && `    const ${functionName} = React.useCallback(${voidReturnFunctionCode}, [${dependencies.join(', ')}])`
        }

        const uiElementActionHandlers = (el: Element) => {
            return el.propertyDefs
                .filter( def => !def.state )
                .filter(isActionProperty)
                .map( (def) => actionHandler(el, def))
                .filter( notEmpty )
        }

        const stateActionHandlers = (el: Element) => {
            return el.propertyDefs
                .filter( def => def.state )
                .filter(isActionProperty)
                .map( (def) => actionHandler(el, def))
                .filter( notEmpty )
        }

        const generateActionHandlers = (elements: ReadonlyArray<Element>, actionHandlerFn: any) => {
            const actions = flatten(elements.map(  actionHandlerFn) as string[][])
            return actions.join('\n')
        }

        const statefulComponents = allComponentElements.filter(el => el.type() === 'statefulUI' || el.type() === 'background')
        const isStatefulComponentName = (name: string) => statefulComponents.some(comp => comp.codeName === name)
        const stateEntries = statefulComponents.map((el): StateEntry => {
            const entry = this.initialStateEntry(el, topLevelFunctions, component instanceof ListItem ? component.list : component)
            const identifiers = this.parser.stateIdentifiers(el.id)
            const stateComponentIdentifiersUsed = identifiers.filter(id => isStatefulComponentName(id) && id !== el.codeName)
            return [el, entry, stateComponentIdentifiersUsed]
        }).filter(([, entry]) => !!entry)

        const inlineStateBlock = () => topoSort(stateEntries).map(([el, entry]) => {
            const name = el.codeName
            const pathExpr = componentIsApp ? `'app.${name}'` : `pathWith('${name}')`
            if (entry instanceof DefinedFunction) {
                return `    const ${name} = ${entry.functionDef}`
            } else {
                const actionFunctions = stateActionHandlers(el).filter( notBlank ).join('\n')
                const stateObjectDeclaration = `    const ${name} = Elemento.useObjectState(${pathExpr}, ${entry})`
                return [actionFunctions, stateObjectDeclaration].filter( notBlank ).join('\n')
            }
        }).join('\n')

        const formState = () => {
            return `    const \$form = Elemento.useGetObjectState(props.path)` + '\n'
                 + inlineStateBlock() + '\n'
                 + `    \$form._updateValue()`

        }

        const stateBlock = componentIsForm ? formState() : inlineStateBlock()

        const backgroundFixedComponents = componentIsApp ? component.otherComponents.filter(comp => comp.type() === 'backgroundFixed') : []
        const backgroundFixedDeclarations = backgroundFixedComponents.map(comp => {
            const entry = this.initialStateEntry(comp, topLevelFunctions, component instanceof ListItem ? component.list : component)
            return `    const [${comp.codeName}] = React.useState(${entry})`
        }).join('\n')

        const pathWith = componentIsApp ? `    const pathWith = name => '${component.codeName}' + '.' + name`
            : `    const pathWith = name => props.path + '.' + name`
        const parentPathWith = canUseContainerElements ? `    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name` : ''

        const extraDeclarations = component instanceof ListItem ? '    const {$item} = props' : ''



        const uiElementActionFunctions = generateActionHandlers(allComponentElements, uiElementActionHandlers)
        const functionNamePrefix = this.functionNamePrefix(containingComponent)
        const functionName = functionNamePrefix + (component instanceof ListItem ? component.list.codeName + 'Item' : component.codeName)

        const declarations = [
            pathWith, parentPathWith, extraDeclarations, elementoDeclarations,
            backgroundFixedDeclarations, stateBlock, uiElementActionFunctions
        ].filter(d => d !== '').join('\n')
        const exportClause = componentIsApp ? 'export default ' : ''
        const componentFunction = `${exportClause}function ${functionName}(props) {
${declarations}

    return ${uiElementCode}
}
`.trimStart()

        const stateNames = statefulComponents.map( el => el.codeName )
        const stateClass = componentIsForm ? `${functionName}.State = class ${functionName}_State extends Elemento.components.BaseFormState {
    ownFieldNames = [${stateNames.map(quote).join(', ')}]
}
`.trimStart() : ''

        return [...topLevelFunctions, componentFunction, stateClass].filter(identity).join('\n\n')
    }

    private functionNamePrefix(containingComponent: Element | undefined) {
        return containingComponent ? containingComponent.codeName + '_' : ''
    }

    private modelProperties = (element: Element) => {
        const propertyDefs = element.propertyDefs.filter(def => !def.state)
        const propertyExprs = propertyDefs.map(def => {
            const exprType: ExprType = isActionProperty(def) ? 'reference' : 'singleExpression'
            const expr = this.getExpr(element, def.name, exprType)
            return [def.name, expr]
        })

        return Object.fromEntries(propertyExprs.filter(([, expr]) => !!expr))
    }

    private generateComponentCode(element: Element | ListItem, app: App, topLevelFunctions: FunctionCollector): string {

        const generateChildren = (element: Element, indent: string = indentLevel2, containingComponent?: Page | Form) => {
            const elementArray = element.elements ?? []
            const generatedUiElements = elementArray.map(p => this.generateElement(p, app, topLevelFunctions, containingComponent))
            const generatedUiElementLines = generatedUiElements.filter(line => !!line).map(line => `${indent}${line},`)
            return generatedUiElementLines.join('\n')
        }

        if (element instanceof ListItem) {
            return `React.createElement(React.Fragment, null,
${generateChildren(element.list)}
    )`
        }

        switch (element.kind) {
            case 'App':
            case 'Tool': {
                const app = element as App
                const topChildrenElements = app.topChildren.map(p => `${this.generateElement(p, app, topLevelFunctions)}`).filter(line => !!line.trim()).join(',\n')
                const topChildren = topChildrenElements.length ? `topChildren: React.createElement( React.Fragment, null, ${topChildrenElements})\n    ` : ''
                const bottomChildrenElements = app.bottomChildren.map(p => `        ${this.generateElement(p, app, topLevelFunctions)}`).filter(line => !!line.trim()).join(',\n')
                const bottomChildren = bottomChildrenElements ? `\n${bottomChildrenElements}\n    ` : ''

                return `React.createElement(App, {path: '${app.codeName}', ${objectLiteralEntries(this.modelProperties(element), ',')}${topChildren}},${bottomChildren})`
            }

            case 'Page': {
                const page = element as Page
                return `React.createElement(Page, {id: props.path},
${generateChildren(page, indentLevel2, page)}
    )`
            }

            case 'Form': {
                const form = element as Form
                return `React.createElement(Form, props,
${generateChildren(form, indentLevel2, form)}
    )`
            }

        }

        throw new Error('Cannot generate component code for ' + element.kind)
    }

    private generateElement(element: Element, app: App, topLevelFunctions: FunctionCollector, containingComponent?: Page): string {

        const generateChildren = (element: Element, indent: string = indentLevel2, containingComponent?: Page) => {
            const elementArray = element.elements ?? []
            const generatedUiElements = elementArray.map(p => this.generateElement(p, app, topLevelFunctions, containingComponent))
            const generatedUiElementLines = generatedUiElements.filter(line => !!line).map(line => `${indent}${line},`)
            return generatedUiElementLines.join('\n')
        }

        const path = `pathWith('${(element.codeName)}')`

        const getReactProperties = () => {
            return {path, ...(this.modelProperties(element))}
        }

        switch (element.kind) {
            case 'Project':
            case 'App':
            case 'Tool':
            case 'Page': {
                throw new Error('Cannot generate element code for ' + element.kind)
            }

            case 'Text': {
                const text = element as Text
                const content = this.getExpr(text, 'content')
                const reactProperties = omit(['content'], getReactProperties())
                return `React.createElement(TextElement, ${objectLiteral(reactProperties)}, ${content})`
            }

            case 'TextInput':
            case 'NumberInput':
            case 'DateInput':
            case 'SelectInput':
            case 'TrueFalseInput':
            case 'SpeechInput':
            case 'Button':
            case 'Icon':
            case 'Image':
            case 'UserLogon':
            case 'MenuItem':
            case 'Data':
            case 'Calculation':
            case 'Collection':
                return `React.createElement(${runtimeElementName(element)}, ${objectLiteral(getReactProperties())})`

            case 'Menu':
            case 'AppBar':
            case 'Layout': {
                return `React.createElement(${runtimeElementName(element)}, ${objectLiteral(getReactProperties())},
${generateChildren(element, indentLevel3, containingComponent)}
    )`
            }

            case 'List': {
                const list = element as List
                const listItemCode = this.generateComponent(app, new ListItem(list), containingComponent)
                topLevelFunctions.add(listItemCode)
                const itemContentComponent = containingComponent!.codeName + '_' + list.codeName + 'Item'

                const reactProperties = {path, itemContentComponent, ...this.modelProperties(element)}
                return `React.createElement(${runtimeElementName(element)}, ${objectLiteral(reactProperties)})`
            }

            case 'Form': {
                const form = element as Form
                const formCode = this.generateComponent(app, form, containingComponent)
                topLevelFunctions.add(formCode)
                const formComponentName = containingComponent!.codeName + '_' + form.codeName

                return `React.createElement(${formComponentName}, ${objectLiteral(getReactProperties())})`
            }

            case 'MemoryDataStore':
            case 'FileDataStore':
            case 'BrowserDataStore':
            case 'FirestoreDataStore':
            case 'Function':
            case 'FunctionImport':
            case 'FirebasePublish':
            case 'ServerApp':
            case 'ServerAppConnector':
            case 'File':
            case 'FileFolder':
            case 'ToolFolder':
            case 'ToolImport':
                return ''

            // Types done in TypesGenerator
            case 'DataTypes':
            case 'Rule':
            case 'TextType':
            case 'NumberType':
            case 'DecimalType':
            case 'DateType':
            case 'ChoiceType':
            case 'RecordType':
            case 'ListType':
            case 'TrueFalseType':
                return ''

            default:
                throw new UnsupportedValueError(element.kind)
        }
    }

    private initialStateEntry(element: Element, topLevelFunctions: FunctionCollector, containingElement: Element): string | DefinedFunction {


        const propName = (def: PropertyDef) => {
            if (def.name === 'initialValue') return 'value'
            if (element.kind === 'Calculation' && def.name === 'calculation') return 'value'
            return def.name
        }
        const modelProperties = () => {
            const propertyExprs = element.propertyDefs
                .filter(({state}) => state)
                .map(def => {
                    const exprType: ExprType = isActionProperty(def) ? 'reference' : 'singleExpression'
                    const expr = this.getExpr(element, def.name, exprType)
                    return [propName(def), expr]
                })
                .filter(([, expr]) => !!expr)
            const props = Object.fromEntries(propertyExprs)
            if (containingElement.kind === 'Form' && props.value === undefined) {
                props.value = `\$form.originalValue?.${element.codeName}`
            }
            return props
        }

        if (element.kind === 'Project') {
            throw new Error('Cannot generate code for Project')
        }

        if (element.kind === 'Function') {
            const functionDef = element as FunctionDef
            const calculation = this.getExprWithoutParens(functionDef, 'calculation', 'multilineExpression')
            return new DefinedFunction(`(${functionDef.inputs.join(', ')}) => ${calculation}`)
        }

        if (element.kind === 'ServerAppConnector') {
            const connector = element as ServerAppConnector
            const [configFunction, configFunctionName] = this.serverAppConfigFunction(connector)
            topLevelFunctions.add(configFunction)
            return `new ${runtimeElementName(element)}.State({configuration: ${configFunctionName}()})`
        }

        if (element.kind === 'Form') {
            const formName = this.functionNamePrefix(containingElement) + element.codeName
            return `new ${formName}.State(${objectLiteral(modelProperties())})`
        }

        if (element.type() === 'statefulUI' || element.type() === 'background') {
            return `new ${runtimeElementName(element)}.State(${objectLiteral(modelProperties())})`
        }

        if (element.type() === 'backgroundFixed') {
            return `new ${runtimeElementName(element)}(${objectLiteral(modelProperties())})`
        }

        return ''
    }

    private serverAppConfigFunction(connector: ServerAppConnector) {
        const serverAppName = this.getExprWithoutParens(connector, 'serverApp')
        let configExpr, configFunctionName
        if (!serverAppName) {
            configExpr = '{}'
            configFunctionName = 'configServerApp'
        } else {
            const serverApp = this.project.findChildElements(ServerApp).find(el => el.codeName === serverAppName)
            configFunctionName = serverApp ? `config${serverApp.codeName}` : `configServerApp`
            if (serverApp) {
                const functionInfo = (fn: FunctionDef) => fn.action ? {
                    params: fn.inputs,
                    action: true
                } : {params: fn.inputs}

                const serverUrlExpr = this.getExprWithoutParens(connector, 'serverUrl')
                configExpr = `{
                appName: '${serverApp.name}',
                url: ${serverUrlExpr || `'/capi/${serverApp.codeName}'`},
                functions: ${valueLiteral(Object.fromEntries(serverApp.functions.map(fn => [fn.codeName, functionInfo(fn)])))}
            }`

            } else {
                const errorMessage = `Unknown name`
                configExpr = `Elemento.codeGenerationError(\`'${connector.serverApp?.expr}'\`, '${errorMessage}')`
            }
        }
        const configFunction = `function ${configFunctionName}() {
    return ${configExpr}
}`
        return [Generator.prettyPrint(configFunction), configFunctionName]
    }

    private getExpr(element: Element, propertyName: string, exprType: ExprType = 'singleExpression', argumentNames?: string[]) {
        const errorMessage = this.parser.propertyError(element.id, propertyName)
        if (errorMessage && !errorMessage.startsWith('Incomplete item')) {
            return `Elemento.codeGenerationError(\`${this.parser.getExpression(element.id, propertyName)}\`, '${errorMessage}')`
        }

        const ast = this.parser.getAst(element.id, propertyName)
        if (ast === undefined) {
            return undefined
        }
        const isJavascriptFunctionBody = element.kind === 'Function' && propertyName === 'calculation' && (element as FunctionDef).javascript
        if (!isJavascriptFunctionBody) {
            this.convertAstToValidJavaScript(ast, exprType);
        }

        // remove braces if the ast is a block statement from wrapping in a function
        const exprCode = print(ast, {quote: 'single', objectCurlySpacing: false}).code.replace(/;$/, '').replace(/^\{\n/, '').replace(/\n\}$/, '')

        switch (exprType) {
            case 'singleExpression':
                return exprCode
            case 'action': {
                const argList = (argumentNames ?? []).join(', ')
                const body = propertyName === 'keyAction' ? `const \$key = \$event.key\n${exprCode}` : exprCode
                const asyncPrefix = body.match(/\bawait\b/) ? 'async ' : ''
                return `${asyncPrefix}(${argList}) => {\n${indent(body, '        ')}\n    }`
            }
            case 'multilineExpression': {
                return exprCode.trim() ? `{\n${indent(exprCode, '        ')}\n    }` : '{}'
            }
            case 'reference': {
                return `${element.codeName}_${propertyName}`
            }
        }
    }

    private convertAstToValidJavaScript(ast:any, exprType: ExprType) {
        function isShorthandProperty(node: any) {
            return node.shorthand
        }

        function addReturnStatement(ast: any) {
            const bodyStatements = ast.program.body as any[]
            const lastStatement = last(bodyStatements)
            const b = types.builders
            ast.program.body[bodyStatements.length - 1] = b.returnStatement(lastStatement.expression)
        }

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
                const b = types.builders
                const node = path.value
                const functionName = node.callee.name
                const argsToTransform = functionArgIndexes[functionName as keyof typeof functionArgIndexes]
                argsToTransform?.forEach(index => {
                    const bodyExpr = node.arguments[index] ?? b.nullLiteral()
                    node.arguments[index] = b.arrowFunctionExpression([b.identifier('$item')], bodyExpr)
                })
                this.traverse(path)
            }
        })

        if (exprType === 'multilineExpression') {
            addReturnStatement(ast)
        }
    }

    private getExprWithoutParens(element: Element, propertyName: string, exprType: ExprType = 'singleExpression') {
        return trimParens(this.getExpr(element, propertyName, exprType))
    }

    private htmlRunnerFile() {
        const appName = this.app.codeName
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
    import {runAppFromWindowUrl} from '/lib/${runtimeFileName}'
    runAppFromWindowUrl()
</script>
</body>
</html>
`
    }
}
