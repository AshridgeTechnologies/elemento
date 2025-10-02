import {parse, prettyPrint} from 'recast'

import App from '../model/App'
import Element from '../model/Element'
import {flatten, identity, mergeDeepRight, omit, without} from 'ramda'
import Parser, {isAppStateFunction, PropertyError} from './Parser'
import {AllErrors, ElementErrors, ExprType, GeneratorOutput, ListItem, runtimeElementName, runtimeImportPath} from './Types'
import {notBlank, notEmpty} from '../util/helpers'
import {
    allElements,
    convertAstToValidJavaScript, functionInputs,
    generateDestructures,
    GeneratedFile,
    indent,
    isAppLike,
    objectBuilder,
    printAst,
    quote,
    RequiredImports,
    StateInitializer,
    topoSort,
    TopoSortError,
    valueLiteral
} from './generatorHelpers'
import Project from '../model/Project'
import ServerAppConnector from '../model/ServerAppConnector'
import ServerApp from '../model/ServerApp'
import {ElementType, EventActionPropertyDef, MultiplePropertyValue, PropertyDef, PropertyValue} from '../model/Types'
import TypesGenerator from './TypesGenerator'
import {ASSET_DIR} from "../shared/constants"
import ComponentDef from '../model/ComponentDef'
import {BaseApp} from '../model/BaseApp'
import ComponentInstance from '../model/ComponentInstance'
import OutputProperty from '../model/OutputProperty'
import BaseElement from '../model/BaseElement'
import InputProperty from '../model/InputProperty'
import {elementOfType} from '../model/elements'

const FormClass = elementOfType('Form')
type Form = typeof FormClass

const PageClass = elementOfType('Page')
type Page = typeof PageClass

const FunctionDefClass = elementOfType('Function')
type FunctionDef = typeof FunctionDefClass

const FunctionImportClass = elementOfType('FunctionImport')
type FunctionImport = typeof FunctionImportClass

const TinyBaseDataStoreClass = elementOfType('TinyBaseDataStore')
type TinyBaseDataStore = typeof TinyBaseDataStoreClass

export type DebugErrors = {[name: string]: string}

const union = <T>(set1: Set<T>, set2: Set<T>) => new Set<T>([...set1, ...set2])
type FunctionCollector = {add(s: string): void}
class ImportsCollector {
    components = new Set<string>
    globalFunctions = new Set<string>
    appFunctions = new Set<string>

    add(other: RequiredImports) {
        this.components = union(this.components, other.components)
        this.globalFunctions = union(this.globalFunctions, other.globalFunctions)
        this.appFunctions = union(this.appFunctions, other.appFunctions)
    }
}

const indentLevel2 = '        '
const indentLevel3 = '            '
const trimParens = (expr?: string) => expr?.startsWith('(') ? expr.replace(/^\(|\)$/g, '') : expr

const isActionProperty = (def: PropertyDef) => (def.type as EventActionPropertyDef).type === 'Action'

class CodeError {
    constructor(public expression: string, public error: string) {}
    toString() {
        return `codeGenerationError(\`${this.expression}\`, '${(this.error)}')`
    }
}
export const DEFAULT_IMPORTS = [
    `const runtimeUrl = window.elementoRuntimeUrl || '${runtimeImportPath}/runtime.js'`,
    `const Elemento = await import(runtimeUrl)`,
    `const {React, trace, elProps, stateProps, wrapFn, useComponentState, codeGenerationError} = Elemento`
]

export function generate(app: BaseApp, project: Project, imports: string[] = DEFAULT_IMPORTS) {
    return new Generator(app, project, imports).output()
}

export default class Generator {
    private parser: Parser
    private typesGenerator
    private errors: AllErrors = {}

    constructor(public app: BaseApp, private project: Project, public imports: string[] = DEFAULT_IMPORTS) {
        this.parser = new Parser(app, project)
        this.parser.parseComponent(project.dataTypesContainer)
        project.componentsFolder && this.parser.parseComponent(project.componentsFolder)
        this.parser.parseComponent(app)
        this.typesGenerator = new TypesGenerator(project)
    }

    static prettyPrint(code: string) {
        return prettyPrint(parse(code), {quote: 'single', objectCurlySpacing: false}).code
    }

    output() {
        const {files: typesFiles, typesClassNames} = this.typesGenerator.output()
        const componentFiles = this.project.userDefinedComponents.map(comp => ({
            name: `${(comp.codeName)}.js`,
            ...this.generateComponent(this.app, comp)
        }))

        const pageFiles = this.app.pages.map(page => ({
            name: `${(page.codeName)}.js`,
            ...this.generateComponent(this.app, page)
        }))

        const appFileName = this.app.kind === 'App' ? 'appMain.js' : `${this.app.codeName}.js`
        const appFile = {
            name: appFileName,
            ...this.generateComponent(this.app, this.app)
        }

        const imports = [...this.imports, ...this.generateFunctionImports(this.app)].join('\n') + '\n'
        const elementoDestructures = generateDestructures([...componentFiles, ...pageFiles, appFile]) + '\n\n'
        const typesConstants = typesFiles.length ? `const {types: {${typesClassNames.join(', ')}}} = Elemento\n\n` : ''
        return <GeneratorOutput>{
            files: [...typesFiles, ...componentFiles, ...pageFiles, appFile],
            errors: mergeDeepRight(this.errors, this.parser.allErrors()),
            get code() {
                return imports + elementoDestructures + typesConstants + this.files.map(f => `// ${f.name}\n${f.contents}`).join('\n')
            },
            html: this.htmlRunnerFile()
        }
    }

    generateDurableObjectClasses(): string[] {
        const durableObjectClass = (el: TinyBaseDataStore) => {
            const authUser = !!el.authorizeUser
            const authSync = !!el.authorizeData
            const baseClass = authSync ? 'TinyBaseAuthSyncDurableObject' : 'TinyBaseFullSyncDurableObject'
            const authUserFn = authUser ? `authorizeUser = ${this.getExpr(el, 'authorizeUser', 'multilineExpression', ['$userId'])} ` : ''
            const authDataFn = authSync ? `authorizeData = ${this.getExpr(el, 'authorizeData', 'multilineExpression', ['$userId', '$tableId', '$rowId', '$changes'])}` : ''
            return `export class ${el.codeName} extends ${baseClass} {
    ${authUserFn}
    ${authDataFn}
}`
        }

        const syncedTinyBaseStores = this.project.findElementsBy(el => el.kind === 'TinyBaseDataStore' && (el as TinyBaseDataStore).syncWithServer) as TinyBaseDataStore[]
        return syncedTinyBaseStores.map(el => durableObjectClass(el))
    }

    private generateFunctionImports(app: BaseApp) {
        const generateImport = ({source, codeName, exportName}: FunctionImport) => {
            const isHttp = source?.match(/^https?:\/\//)
            if (isHttp) {
                const exportNameArg = exportName ? `, '${exportName}'` : ''
                return `const ${codeName} = await importModule('${source}'${exportNameArg})`
            } else {
                const exportNameArg = exportName ? `'${exportName}'` : ''
                const rootPath = app.kind === 'Tool' ? '../..' : '..'
                const importPath = `${rootPath}/${ASSET_DIR}/${source ?? codeName + '.js'}`
                return `const ${codeName} = await import('${importPath}').then(...importHandlers(${exportNameArg}))`
            }
        }

        const functionImports = app.findChildElements('FunctionImport') as FunctionImport[]
        return functionImports.length ? [`const {importModule, importHandlers} = Elemento`, ...functionImports.map(generateImport)] : []
    }

    private generateComponent(app: BaseApp, component: Page | BaseApp | Form | ListItem | ComponentDef, containingComponent?: Page | Form): GeneratedFile {
        const requiredImports = new ImportsCollector()
        const componentIsApp = isAppLike(component)
        const componentIsListItem = component instanceof ListItem
        const componentIsForm = component instanceof FormClass
        const componentIsPage = component instanceof PageClass
        const componentIsComponentDef = component instanceof ComponentDef
        const canUseContainerElements = componentIsListItem && containingComponent
        const topLevelFunctions = new Set<string>()
        const allPages = app.pages
        const allComponentElements = allElements(component, true)
        const allContainerElements = canUseContainerElements ? allElements(containingComponent, true) : []
        const isAppElement = (name: string) => !!app.otherComponents.find( el => el.codeName === name && el.kind !== 'FunctionImport' )
        const isContainerElement = (name: string) => !!allContainerElements.find(el => el.codeName === name )
        const uiElementCode = this.generateComponentCode(component, app, topLevelFunctions, requiredImports)
        const identifiers = this.parser.componentIdentifiers(component.id)
        const appLevelIdentifiers = identifiers.filter(isAppElement)

        const appStateFunctionIdentifiers = this.parser.appStateFunctionIdentifiers(component.id)
        const pages = componentIsApp ? `    const pages = {${allPages.map(p => p.codeName).join(', ')}}` : ''
        const urlContext = componentIsApp ? `    const urlContext = Elemento.useGetUrlContext()` : ''
        const themeOptions = componentIsApp ? `    const themeOptions = ${this.getExpr(app, 'themeOptions', 'singleExpression')}` : ''
        const usesApp = appStateFunctionIdentifiers.length || appLevelIdentifiers.length
        const appStateDeclaration = componentIsApp
            ? `    const _state = useComponentState('${app.codeName}', ${component.codeName}.State, {pages, urlContext, themeOptions})`
            : usesApp ? `    const app = useComponentState('${app.codeName}')` : ''
        const appStateFunctionDeclarations = appStateFunctionIdentifiers.length ? `    const {${appStateFunctionIdentifiers.join(', ')}} = ${componentIsApp ? '_state' : 'app'}` : ''
        const componentIdentifiersFound = this.parser.identifiersOfTypeComponent(component.id).map( comp => comp === 'Tool' ? 'App' : comp)
        const itemSetItemIdentifier = componentIsListItem ? ['ItemSetItem'] : []
        const componentIdentifiers = [...itemSetItemIdentifier, ...componentIdentifiersFound]
        const inputPropertyElements = (component as BaseElement<any>).findChildElements(InputProperty)
        const inputPropertyNames = inputPropertyElements.map( el => el.codeName )
        const outputPropertyElements = (component as BaseElement<any>).findChildElements(OutputProperty)
        const statefulComponents = allComponentElements.filter(el => this.project.componentTypeIs(el, 'statefulUI', 'background') )
        const functionComponents = statefulComponents.filter(el => el.kind === 'Function')
        const nonFunctionComponents = statefulComponents.filter(el => el.kind !== 'Function')
        const statefulContainerComponents = allContainerElements.filter(el => this.project.componentTypeIs(el, 'statefulUI', 'background') )
        const isStatefulComponentName = (name: string) => nonFunctionComponents.some(comp => comp.codeName === name)
        const isStatefulContainerComponentName = (name: string) => statefulContainerComponents.some(comp => comp.codeName === name)
        const isInputProperty = (name: string) => inputPropertyNames.includes(name)
        const isOutputProperty = (name: string) => outputPropertyElements.some(comp => comp.codeName === name)
        const isStateFunction = (name: string) => functionComponents.some(comp => comp.codeName === name)
        componentIdentifiers.forEach( id => requiredImports.components.add(id) )
        const globalFunctionIdentifiers = this.parser.globalFunctionIdentifiers(component.id)
        globalFunctionIdentifiers.forEach( id => requiredImports.globalFunctions.add(id) )
        const appFunctionIdentifiers = this.parser.appFunctionIdentifiers(component.id)
        appFunctionIdentifiers.forEach( id => requiredImports.appFunctions.add(id) )
        const toolsDeclarations = this.app.kind === 'Tool' ? `    const {Editor, Preview} = Elemento` : ''

        const functionNamePrefix = this.functionNamePrefix(containingComponent)
        const functionName = functionNamePrefix + (componentIsListItem ? component.itemSet.codeName + 'Item' : component.codeName)

        let stateObjectDeclaration = ''
        if (componentIsPage) {
            const appProp = usesApp ? 'app' : ''
            stateObjectDeclaration = `    const _state = useComponentState(props.path, ${functionName}.State, {${appProp}})`
        }
        if (componentIsComponentDef && (component as ComponentDef).isStateful(this.project)) {
            stateObjectDeclaration = `    const _state = useComponentState(props.path)`
        }
        if (componentIsListItem) {
            stateObjectDeclaration = `    const _state = useComponentState(props.path, ${functionName}.State, {$item, $itemId, $index, $selected})`
        }
        if (componentIsForm) {
            stateObjectDeclaration = `    const _state = useComponentState(props.path)`
        }
        let appLevelDeclarations
        if (!componentIsApp) {
            appLevelDeclarations = appLevelIdentifiers.map(ident => `    const ${ident} = app.${ident}`).join('\n')
        }
        let containerDeclarations: string = ''
        let containerUse = ''
        if (canUseContainerElements) {
            const containerIdentifiers = identifiers.filter(isContainerElement)
            if (containerIdentifiers.length) {
                containerUse = `    const \$container = useComponentState(Elemento.parentPath(props.path))`
                containerDeclarations = `    const {${containerIdentifiers.join(', ')}} = \$container`
            }
        }
        const elementoDeclarations = [toolsDeclarations, pages, urlContext, themeOptions,
            appStateDeclaration, appStateFunctionDeclarations, appLevelDeclarations, containerUse, containerDeclarations, stateObjectDeclaration].filter(d => d !== '').join('\n').trimEnd()

        const actionHandler = (el: Element, def: PropertyDef) => {
            const actionDef = def.type as EventActionPropertyDef
            const formKeyPrefix = el.kind === 'Form' && def.name === 'keyAction' ? `const \$key = \$event.key\n` : ''
            const bodyPrefix = formKeyPrefix + dependencyDeclarations(el, def.name) + '\n'
            const functionExpr = this.getExpr(el, def.name, 'action', actionDef.argumentNames, bodyPrefix)
            const async = typeof functionExpr === 'string' && functionExpr.startsWith('/*async*/')
            const asyncPrefix = async ? 'async ' : ''
            const functionWithoutPrefix = typeof functionExpr === 'string' ? functionExpr.replace('/*async*/', '') : functionExpr
            const functionCode = functionExpr instanceof CodeError ? `() { return ${functionWithoutPrefix}}` : functionWithoutPrefix
            // const wrappedFunctionCode = `wrapFn('${component.codeName}.${el.codeName}', '${def.name}', ${functionCode})`

            const functionName = `${el.codeName}_${def.name}`
            return functionExpr && `    ${asyncPrefix}${functionName}${functionCode}`
        }

        const functionDeclaration = (el: FunctionDef) => {
            const exprType = el.action ? 'action' : 'multilineExpression'
            const bodyPrefix = dependencyDeclarations(el, 'calculation') + '\n'
            const inputs = functionInputs(el)
            const functionExpr = this.getExpr(el, 'calculation', exprType, inputs, bodyPrefix) ?? '() {}'
            const async = typeof functionExpr === 'string' && functionExpr.startsWith('/*async*/')
            const asyncPrefix = async ? 'async ' : ''
            const functionWithoutPrefix = typeof functionExpr === 'string' ? functionExpr.replace('/*async*/', '') : functionExpr
            const functionCode = functionExpr instanceof CodeError ? `() { return ${functionWithoutPrefix}}` : functionWithoutPrefix
            // const wrappedFunctionCode = `wrapFn('${component.codeName}.${el.codeName}', 'calculation', ${functionCode})`
            const functionName = `${el.codeName}`
            return functionCode && `    ${asyncPrefix}${functionName}${functionCode}`
        }

        const actionHandlers = (el: Element, state: boolean) => {
            return this.project.propertyDefsOf(el)
                .filter( def => Boolean(def.state) === state )
                .filter(isActionProperty)
                .map( (def) => actionHandler(el, def))
                .filter( notEmpty )
        }
        const uiElementActionHandlers = (el: Element) => actionHandlers(el, false)
        const stateActionHandlers = (el: Element) => actionHandlers(el, true)
        const generateActionHandlers = (elements: ReadonlyArray<Element>, actionHandlerFn: any) => {
            const actions = flatten(elements.map(  actionHandlerFn) as string[][])
            return actions.join('\n')
        }

        const stateInitializers = nonFunctionComponents.map((el): StateInitializer => {
            const initState = this.initialState(el, topLevelFunctions, componentIsListItem ? component.itemSet : component)
            const identifiers = this.parser.stateIdentifiers(el.id)
            const stateComponentIdentifiersUsed = identifiers.filter(id => isStatefulComponentName(id) && id !== el.codeName)
            return [el, initState, stateComponentIdentifiersUsed]
        }).filter(([, initState]) => !!initState)

        const sortStateInitializers = () => {
            try {
                return topoSort(stateInitializers)
            } catch(e: any) {
                if (e instanceof TopoSortError) {
                    this.errors[e.elementId] ||= {}
                    this.errors[e.elementId]['element'] = e.message
                } else {
                    throw e
                }

                return stateInitializers
            }
        }

        const dependencyDeclarations =  (el: Element, propertyName: string, lineIndent = '') => {
            const identifiers = this.parser.statePropertyIdentifiers(el.id, propertyName)
            const thisDeclarationNames = identifiers.filter(ident => isStatefulComponentName(ident) || isOutputProperty(ident) || isStateFunction(ident))
            const thisDeclarations = thisDeclarationNames.length ? `const {${thisDeclarationNames.join(', ')}} = this` : ''
            const appTarget = componentIsApp ? 'this' : 'this.app'
            const appFeatures = identifiers.filter(isAppElement)
            const appFeatureDeclarations = appFeatures.length ? `const {${appFeatures.join(', ')}} = ${appTarget}` : ''
            const appStateFunctions = identifiers.filter(isAppStateFunction)
            const appStateFunctionDeclarations = appStateFunctions.length ? `const {${appStateFunctions.join(', ')}} = ${appTarget}` : ''
            const inputProperties = identifiers.filter(isInputProperty)
            const inputPropertyNameDeclarations = inputProperties.length ? `const {${inputProperties.join(', ')}} = this.props` : ''

            return [thisDeclarations, appFeatureDeclarations, appStateFunctionDeclarations, inputPropertyNameDeclarations].filter(identity).join('\n' + lineIndent)
        }

        const statefulComponentNames = statefulComponents.map( el => el.codeName )
        const stateBlock = statefulComponentNames.length ? `    const {${statefulComponentNames.join(', ')}} = _state` : ''

        const outputProperty = (el: OutputProperty) => {
            const declarations = dependencyDeclarations(el, 'calculation', indentLevel2)
            return `    get ${el.codeName}() { 
        ${declarations}
        return ${this.getExpr(el, 'calculation')}
    }`
        }

        const backgroundFixedComponents = componentIsApp ? component.otherComponents.filter(comp => this.project.componentTypeIs(comp, 'backgroundFixed')) : []
        const backgroundFixedDeclarations = backgroundFixedComponents.map(comp => {
            const entry = this.initialState(comp, topLevelFunctions, componentIsListItem ? component.itemSet : component)
            return `    const [${comp.codeName}] = React.useState(${entry})`
        }).join('\n')

        const pathTo = componentIsApp ? `    const pathTo = name => '${component.codeName}' + '.' + name`
            : `    const pathTo = name => props.path + '.' + name`
        const parentPathWith = canUseContainerElements ? `    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name` : ''
        const inputProperties = inputPropertyElements.length ? `    const {${inputPropertyElements.map( el => el.codeName).join(', ')}} = props` : ''
        const extraDeclarations = componentIsListItem ? '    const {$item, $itemId, $index, $selected, onClick} = props' : ''
        const dragFunctionIdentifiers = this.parser.dragFunctionIdentifiers(component.id)
        const dragFunctionDeclarations =
            dragFunctionIdentifiers.length ? `    const {${dragFunctionIdentifiers.join(', ')}} = Elemento.dragFunctions()` : ''

        const canDragDeclaration = componentIsListItem ? `    const canDragItem = ${this.getExpr(component.itemSet, 'canDragItem')}` : ''
        const stylesDeclaration = componentIsListItem ? `    const styles = ${this.getExpr(component.itemSet, 'itemStyles')}` : ''
        const listItemVarDeclarations = [canDragDeclaration, stylesDeclaration].filter(s => !!s).join('\n')

        const declarations = [
            pathTo, parentPathWith, inputProperties, extraDeclarations, dragFunctionDeclarations, elementoDeclarations,
            backgroundFixedDeclarations, stateBlock, listItemVarDeclarations
        ].filter(d => d !== '').join('\n')
        const exportClause = componentIsApp ? 'export default ' : ''
        const debugHook = componentIsPage  ? `\n    Elemento.elementoDebug((getObject) => eval(Elemento.useDebugExpr()))` : ''
        const notLoggedInPage = componentIsPage && component.notLoggedInPage ? `\n${functionName}.notLoggedInPage = '${component.notLoggedInPage.expr}'` : ''

        const functionNameSuffix = componentIsListItem ? 'Fn' : ''
        const functionCode = `function ${functionName + functionNameSuffix}(props) {
${declarations}${debugHook}

    return ${uiElementCode}
}`
        const wrappedFunction = componentIsListItem ? `const ${functionName} = React.memo(${functionCode})` : functionCode
        const componentFunction = `${exportClause}${wrappedFunction}${notLoggedInPage}
`.trimStart()


        const appFeatures = component === app ? appStateFunctionIdentifiers : [...appStateFunctionIdentifiers, ...appLevelIdentifiers]
        const appRef = component === app ? 'this' : 'this.app'
        const appFeatureDeclarations = appFeatures.length ? `        const {${appFeatures.join(', ')}} = ${appRef}` : ''
        const itemSetItemDeclarations = componentIsListItem ? '        const {$item, $itemId, $index, $selected, $container} = this.props' : ''

        const pageStateBlock = () => sortStateInitializers().map(([el, initState]) => {
            const name = el.codeName
            if ((initState as FunctionDef).kind === 'Function') {
                return ''// `    const ${name} = this.getOrCreateChildState('${name}', ${functionDeclaration(initState)})`
            } else {
                const stateObjectDeclaration = `        const ${name} = this.getOrCreateChildState('${name}', ${initState})`
                return [stateObjectDeclaration].filter( notBlank ).join('\n')
            }
        }).join('\n')

        const stateFunctionDecls = functionComponents.map( el => functionDeclaration(el as FunctionDef)).join('\n')
        const stateActionHandlerFunctions = generateActionHandlers(allComponentElements, stateActionHandlers)
        const uiActionHandlers = generateActionHandlers(allComponentElements, uiElementActionHandlers)

        const baseClass = componentIsApp ? 'App.State' : 'Elemento.components.ElementoComponentState'
        const pageOrAppStateClass = componentIsPage || componentIsApp ? `${component.codeName}.State = class ${component.codeName}_State extends ${baseClass} {
${[stateFunctionDecls, stateActionHandlerFunctions, uiActionHandlers].filter(identity).join('\n\n')}
}
`.trimStart() : ''

        const stateNames = statefulComponents.filter( el => el.kind !== 'Calculation').map( el => el.codeName )
        const formStateClass = componentIsForm ? `${functionName}.State = class ${functionName}_State extends Elemento.components.BaseFormState {
    ownFieldNames = [${stateNames.map(quote).join(', ')}]
${[stateFunctionDecls, stateActionHandlerFunctions, uiActionHandlers].filter(identity).join('\n\n')}
}
`.trimStart() : ''

        const itemSetItemStateClass = componentIsListItem ? `${functionName}.State = class ${functionName}_State extends Elemento.components.ElementoComponentState {
${[stateFunctionDecls, stateActionHandlerFunctions, uiActionHandlers].filter(identity).join('\n\n')}
}
`.trimStart() : ''
        const componentStateClass = componentIsComponentDef && (component as ComponentDef).isStateful(this.project) ? `${functionName}.State = class ${functionName}_State extends Elemento.components.ElementoComponentState {
${[stateFunctionDecls, stateActionHandlerFunctions, uiActionHandlers].filter(identity).join('\n\n')}
${component.findChildElements(OutputProperty).map( outputProperty).join('\n')}
}
`.trimStart() : ''

        const stateClass = formStateClass || componentStateClass || pageOrAppStateClass || itemSetItemStateClass
        return { requiredImports, contents: [...topLevelFunctions, componentFunction, stateClass].filter(identity).join('\n\n') }
    }

    generateStandaloneBlock(selectedElement: Element | null, exprs: {[name: string] : string}, containingComponent: Page | App, updatesAllowed: string[]): [string, DebugErrors] {
        const exprId = '_standalone'
        this.parser.parseStandaloneExpr(exprId, exprs, containingComponent)
        const standaloneErrors = (this.parser.allErrors()[exprId] ?? {}) as DebugErrors
        const allContainerElements = allElements(containingComponent, true)
        const isAppElement = (name: string) => !!this.app.otherComponents.find( el => el.codeName === name && el.kind !== 'FunctionImport' )
        const isContainerElement = (name: string) => !!allContainerElements.find(el => el.codeName === name )
        const identifiers = this.parser.componentIdentifiers(exprId)

        const selectedElementDeclaration = selectedElement ? `const _selectedElement = getObject('${this.project.findElementPath(selectedElement.id)}')` :''
        const appCodeName = this.app.codeName
        const appStateFunctionIdentifiers = this.parser.appStateFunctionIdentifiers(exprId)
        const appStateDeclaration = appStateFunctionIdentifiers.length ? `const app = getObject('${appCodeName}')` : ''
        const appStateFunctionDeclarations = appStateFunctionIdentifiers.length ? `const {${appStateFunctionIdentifiers.join(', ')}} = app` : ''
        const globalFunctionIdentifiers = this.parser.globalFunctionIdentifiers(exprId)
        const globalDeclarations = globalFunctionIdentifiers.length ? `const {${globalFunctionIdentifiers.join(', ')}} = Elemento.globalFunctions` : ''
        const appFunctionIdentifiers = this.parser.appFunctionIdentifiers(exprId)
        const appFunctionDeclarations = appFunctionIdentifiers.length ? `const {${appFunctionIdentifiers.join(', ')}} = Elemento.appFunctions` : ''

        const containerIdentifiers = identifiers.filter(isContainerElement)
        const containerDeclarations = containerIdentifiers.map(ident => `const ${ident} = getObject(pathTo('${ident}'))`).join('\n')
        const appLevelIdentifiers = identifiers.filter(isAppElement)
        const appLevelOnlyIdentifiers = without(containerIdentifiers, appLevelIdentifiers)
        const appLevelDeclarations = appLevelOnlyIdentifiers.map(ident => `const ${ident} = getObject('${appCodeName}.${ident}')`).join('\n')
        const elementoDeclarations = [globalDeclarations, selectedElementDeclaration,
            appStateDeclaration, appStateFunctionDeclarations, appFunctionDeclarations, appLevelDeclarations, containerDeclarations].filter(d => d !== '').join('\n').trimEnd()

        const pathTo = `const pathTo = name => props.path + '.' + name`
        const declarations = [pathTo, elementoDeclarations,].filter(d => d !== '').join('\n')
        const exprOrError = (name: string, expr: string) => {
            if (standaloneErrors[name]) {
                return `() => ({_error: '${standaloneErrors[name]}'})`
            } else if (updatesAllowed.includes(name)) {
                return `{updateAllowed: true, fn: () => (${expr})}`
            } else {
                return `() => (${expr})`
            }
        }

        const exprBlock = `({\n${Object.entries(exprs).map( ([name, expr]) => `  '${name}': ${exprOrError(name, expr)}`).join(',\n')}\n})`
        return [`${declarations};\n${exprBlock}`.trimStart(), standaloneErrors]
    }

    private functionNamePrefix(containingComponent: Element | undefined) {
        return containingComponent ? containingComponent.codeName + '_' : ''
    }

    private modelProperties = (element: Element) => {
        const propertyDefs = this.project.propertyDefsOf(element)//.filter(def => !def.state || def.stateAndDom)
        const propertyExprs = propertyDefs.map(def => {
            const exprType: ExprType = isActionProperty(def) ? 'reference' : 'singleExpression'
            const expr = this.getExprWithoutParens(element, def.name, exprType)
            return [def.name, expr]
        })

        return Object.fromEntries(propertyExprs.filter(([, expr]) => !!expr))
    }

    private generateComponentCode(element: Element | ListItem, app: BaseApp, topLevelFunctions: FunctionCollector, requiredImports: ImportsCollector): string {

        const generateChildren = (element: Element, indent: string = indentLevel2, containingComponent?: Page | Form) => {
            const elementArray = element.elements ?? []
            const generatedUiElements = elementArray.map(p => this.generateElement(p, app, topLevelFunctions, requiredImports, containingComponent))
            const generatedUiElementLines = generatedUiElements.filter(line => !!line).map(line => `${indent}${line}`)
            return generatedUiElementLines.join(',\n')
        }

        if (element instanceof ListItem) {
            return `React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, index: $index, onClick, canDragItem, styles},
${generateChildren(element.itemSet)}
    )`
        }

        switch (element.kind) {
            case 'App':
            case 'Tool': {
                const app = element as App
                const topChildrenElements = app.topChildren.map(p => `${this.generateElement(p, app, topLevelFunctions, requiredImports)}`).filter(line => !!line.trim()).join(',\n')
                const topChildren = topChildrenElements.length ? `, topChildren: React.createElement( React.Fragment, null, ${topChildrenElements})\n    ` : ''
                const bottomChildrenElements = app.bottomChildren.map(p => `        ${this.generateElement(p, app, topLevelFunctions, requiredImports)}`).filter(line => !!line.trim()).join(',\n')
                const bottomChildren = bottomChildrenElements ? `\n${bottomChildrenElements}\n    ` : ''
                const fontProp = app.fontList.length ? {fonts: `[${app.fontList.map(quote).join(', ')}]`} : {}
                const propsEntries = {...omit(['fonts'], this.modelProperties(app)), ...fontProp, pages: 'pages', urlContext: 'urlContext'}
                return `React.createElement(App, {...${(objectBuilder({fullName: `'${(app.codeName)}'`}, propsEntries))}${topChildren}},${bottomChildren})`
            }

            case 'Page': {
                const page = element as Page
                const propsEntries = omit(['notLoggedInPage'], this.modelProperties(page))
                const pageName = {fullName: 'props.path'}
                return `React.createElement(Page, ${objectBuilder(pageName, propsEntries)},
${generateChildren(page, indentLevel2, page)}
    )`
            }

            case 'Component': {
                const componentDef = element as ComponentDef
                return `React.createElement(ComponentElement, props,
${generateChildren(componentDef, indentLevel2)}
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

    private generateElement(element: Element, app: BaseApp, topLevelFunctions: FunctionCollector, requiredImports: ImportsCollector, containingComponent?: Page | Form): string {

        const generateChildren = (element: Element, indent: string = indentLevel2, containingComponent?: Page | Form) => {
            const elementArray = element.elements ?? []
            const generatedUiElements = elementArray.map(p => this.generateElement(p, app, topLevelFunctions, requiredImports, containingComponent))
            const lines = generatedUiElements.filter(line => !!line).map(line => `${indent}${line}`)
            const ownChildren = lines.length ?  `,\n${lines.join(',\n')}\n    ` : ''
            const otherChildren = element.name === '$children' ? ', props.children' : ''
            return ownChildren + otherChildren
        }

        if (element instanceof ComponentInstance) {
            return `React.createElement(${runtimeElementName(element)}, ${objectBuilder(element.codeName, this.modelProperties(element))}${generateChildren(element, indentLevel3, containingComponent)})`
        }
        switch (element.kind as ElementType) {
            case 'Project':
            case 'App':
            case 'Tool':
            case 'Page': {
                throw new Error('Cannot generate element code for ' + element.kind)
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
                return `React.createElement(${runtimeElementName(element)}, ${objectBuilder(element.codeName, this.modelProperties(element))})`

            case 'Text': {
                const content = this.getExpr(element, 'content')
                // generate content at end as it may be long
                const reactProperties = {...omit(['content'], this.modelProperties(element)), content}
                return `React.createElement(TextElement, ${objectBuilder(element.codeName, reactProperties)}${generateChildren(element, indentLevel3, containingComponent)})`
            }

            case 'Menu':
            case 'AppBar':
            case 'Block':
            case 'Dialog':
            case 'List': {
                return `React.createElement(${runtimeElementName(element)}, ${objectBuilder(element.codeName, this.modelProperties(element))}${generateChildren(element, indentLevel3, containingComponent)})`
            }

            case 'ItemSet': {
                const itemCode = this.generateComponent(app, new ListItem(element as BaseElement<any>), containingComponent)
                requiredImports.add(itemCode.requiredImports)
                topLevelFunctions.add(itemCode.contents)
                const itemContentComponent = containingComponent!.codeName + '_' + element.codeName + 'Item'

                const modelProperties = omit(['canDragItem', 'itemStyles'], this.modelProperties(element))  // used in the item content component
                const reactProperties = {itemContentComponent, ...modelProperties}
                return `React.createElement(${runtimeElementName(element)}, ${objectBuilder(element.codeName, reactProperties)})`
            }

            case 'Form': {
                const form = element as Form
                const formCode = this.generateComponent(app, form, containingComponent)
                requiredImports.add(formCode.requiredImports)
                topLevelFunctions.add(formCode.contents)
                const formComponentName = containingComponent!.codeName + '_' + form.codeName

                return `React.createElement(${formComponentName}, ${objectBuilder(element.codeName, this.modelProperties(element))})`
            }

            case 'MemoryDataStore':
            case 'FileDataStore':
            case 'BrowserDataStore':
            case 'Function':
            case 'FunctionImport':
            case 'Component':
            case 'InputProperty':
            case 'OutputProperty':
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
                return `React.createElement(${runtimeElementName(element)}, ${objectBuilder(element.codeName, this.modelProperties(element))})`
        }
    }

    private initialState(element: Element, topLevelFunctions: FunctionCollector, containingElement: Element): string | FunctionDef {

        const propName = (def: PropertyDef) => {
            // if (def.name === 'initialValue') return 'value'
            // see CalculationState for reason for this conversion
            if (element.kind === 'Calculation' && def.name === 'calculation') return 'initialValue'
            return def.name
        }
        const modelProperties = () => {
            const propertyExprs = this.project.propertyDefsOf(element)
                .filter(({state}) => state)
                .map(def => {
                    const exprType: ExprType = isActionProperty(def) ? 'reference' : 'singleExpression'
                    const expr = this.getExpr(element, def.name, exprType)
                    return [propName(def), expr]
                })
                .filter(([, expr]) => !!expr)
            const props = Object.fromEntries(propertyExprs)
            if (containingElement.kind === 'Form' && props.value === undefined) {
                props.value = `this.originalValue?.${element.codeName}`
            }
            return props
        }

        if (element.kind === 'Project') {
            throw new Error('Cannot generate code for Project')
        }

        if (element.kind === 'Function') {
            return element as FunctionDef
        }

        if (element.kind === 'ServerAppConnector') {
            const connector = element as ServerAppConnector
            const [configFunction, configFunctionName] = this.serverAppConfigFunction(connector)
            topLevelFunctions.add(configFunction)
            return `new ${runtimeElementName(element)}.State({configuration: ${configFunctionName}()})`
        }

        if (element.kind === 'Form') {
            const formName = this.functionNamePrefix(containingElement) + element.codeName
            return `new ${formName}.State(${objectBuilder(element.codeName, modelProperties(), true)})`
        }

        if (element.kind === 'TinyBaseDataStore') {
            const store = element as TinyBaseDataStore
            const modelProps = modelProperties()
            const generatedProps = {
                collections: modelProps.collections,
                databaseTypeName: quote(store.codeName),
                databaseInstanceName: modelProps.databaseName,
                persist: modelProps.storeOnDevice,
                sync: modelProps.syncWithServer,
                serverUrl: modelProps.serverUrl
            }
            return `new ${runtimeElementName(element)}.State(${objectBuilder(element.codeName, generatedProps, true)})`
        }

        if (this.project.componentTypeIs(element, 'statefulUI', 'background')) {
            const builderName = isAppLike(containingElement) ? {fullName: `'${containingElement.codeName}.${element.codeName}'`} : element.codeName
            return `new ${runtimeElementName(element)}.State(${objectBuilder(builderName, modelProperties(), true)})`
        }

        if (this.project.componentTypeIs(element, 'backgroundFixed')) {
            return `new ${runtimeElementName(element)}(${objectBuilder(element.codeName, modelProperties(), true)})`
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
                    params: functionInputs(fn),
                    action: true
                } : {params: functionInputs(fn)}

                const serverUrlExpr = this.getExprWithoutParens(connector, 'serverUrl')
                configExpr = `{
                appName: '${serverApp.name}',
                url: ${serverUrlExpr || `'/capi/${serverApp.codeName}'`},
                functions: ${valueLiteral(Object.fromEntries(serverApp.functions.map(fn => [fn.codeName, functionInfo(fn)])))}
            }`

            } else {
                const errorMessage = `Unknown name`
                configExpr = new CodeError(`'${connector.serverApp?.expr}'`, errorMessage)
            }
        }
        const configFunction = `function ${configFunctionName}() {
    return ${configExpr}
}`
        return [Generator.prettyPrint(configFunction), configFunctionName]
    }

    private getExpr(element: Element, propertyName: string, exprType: ExprType = 'singleExpression', argumentNames?: string[], bodyPrefix: string = '', thisRef = 'this') {

        const isKnownSyncUserFunction = (fnName: string) => {
            const el = this.project.findClosestElementByCodeName(element.id, fnName)
            return el?.kind === 'Function' && !(el as FunctionDef).action
        }

        const getExprCode = (propertyValue: PropertyValue | undefined, error: PropertyError)=> {
            const isIncompleteItemError = (errorMessage: PropertyError) => errorMessage && typeof errorMessage === 'string' && errorMessage.startsWith('Incomplete item')
            if (error && (typeof error === 'string') && !isIncompleteItemError(error)) {
                return new CodeError(this.parser.getExpression(propertyValue) ?? '', error)
            }

            const ast = this.parser.getAst(propertyValue)
            if (ast === undefined) {
                return undefined
            }
            const isJavascriptFunctionBody = element.kind === 'Function' && propertyName === 'calculation' && (element as FunctionDef).javascript
            if (!isJavascriptFunctionBody) {
                convertAstToValidJavaScript(ast, exprType, ['action'], isKnownSyncUserFunction)
            }

            const exprCode = printAst(ast)

            switch (exprType) {
                case 'singleExpression':
                    return exprCode

                case 'action':
                case 'multilineExpression': {
                    const argList = (argumentNames ?? []).join(', ')
                    const body = `${bodyPrefix}${exprCode}`
                    const asyncPrefix = body.match(/\bawait\b/) ? '/*async*/ ' : ''
                    return exprCode.trim() ? `${asyncPrefix}(${argList}) {\n${indent(body, '        ')}\n    }` : '() {}'
                }

                case 'reference': {
                    return `${thisRef}.${element.codeName}_${propertyName}`
                }
            }
        }

        const propertyValue = element.propertyValue(propertyName)
        if (propertyValue === undefined) return undefined
        const error = this.parser.propertyError(element.id, propertyName)

        const propertyDef = this.project.propertyDefsOf(element).find( pd => pd.name === propertyName)
        if (!propertyDef) {
            throw new Error(`Element of kind ${element.kind} does not have a propertyDef ${propertyName}`)
        }

        const propType = propertyDef.type
        if (propType === 'styles') {
            const multiplePropValue = propertyValue as MultiplePropertyValue

            const stylesEntries = Object.entries(multiplePropValue).map( ([name, val]) => {
                const subValueError = (error as ElementErrors)?.[name]
                return [name, getExprCode(val, subValueError)]
            })
            const stylesProps = Object.fromEntries(stylesEntries)
            return objectBuilder(`${element.codeName}.Styles`, stylesProps)
        }

        return getExprCode(propertyValue as PropertyValue, error)
    }

    private getExprWithoutParens(element: Element, propertyName: string, exprType: ExprType = 'singleExpression', thisRef = '_state') {
        return trimParens(this.getExpr(element, propertyName, exprType, undefined, '', thisRef)?.toString())
    }

    private htmlRunnerFile() {
        const {fontList} = this.app
        const fontFamilies = ['Roboto:ital,wght@0,100..900;1,100..900', ...fontList].map( font => `family=${font}`).join('&')
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="initial-scale=1, width=device-width" />
  <title>${this.app.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link id="web-font-link" rel="stylesheet" href="https://fonts.googleapis.com/css2?${fontFamilies}&display=swap"/>
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
`
    }
}
