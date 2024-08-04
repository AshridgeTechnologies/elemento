import {parse, prettyPrint} from 'recast'

import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'
import Element from '../model/Element'
import FunctionDef from '../model/FunctionDef'
import {flatten, identity, omit} from 'ramda'
import Parser, {PropertyError} from './Parser'
import {ElementErrors, ExprType, GeneratorOutput, ListItem, runtimeElementName, runtimeElementTypeName, runtimeImportPath} from './Types'
import {notBlank, notEmpty} from '../util/helpers'
import {
    allElements,
    convertAstToValidJavaScript,
    indent,
    isAppLike,
    objectBuilder,
    printAst,
    quote,
    StateInitializer,
    topoSort,
    valueLiteral
} from './generatorHelpers'
import Project from '../model/Project'
import ServerAppConnector from '../model/ServerAppConnector'
import ServerApp from '../model/ServerApp'
import {ElementType, EventActionPropertyDef, MultiplePropertyValue, PropertyDef, PropertyValue} from '../model/Types'
import TypesGenerator from './TypesGenerator'
import FunctionImport from "../model/FunctionImport";
import {ASSET_DIR} from "../shared/constants";
import Form from '../model/Form'
import ComponentDef from '../model/ComponentDef'
import {BaseApp} from '../model/BaseApp'
import ItemSet from '../model/ItemSet'

export type DebugErrors = {[name: string]: string}

type FunctionCollector = {add(s: string): void}

const indentLevel2 = '        '
const indentLevel3 = '            '
const trimParens = (expr?: string) => expr?.startsWith('(') ? expr.replace(/^\(|\)$/g, '') : expr

const isActionProperty = (def: PropertyDef) => (def.type as EventActionPropertyDef).type === 'Action'

export const DEFAULT_IMPORTS = [
    `const runtimeUrl = window.elementoRuntimeUrl || '${runtimeImportPath}/runtime.js'`,
    `const Elemento = await import(runtimeUrl)`,
    `const {React, trace, elProps, stateProps, wrapFn} = Elemento`
]

export function generate(app: BaseApp, project: Project, imports: string[] = DEFAULT_IMPORTS) {
    return new Generator(app, project, imports).output()
}

export default class Generator {
    private parser: Parser
    private typesGenerator

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
            contents: this.generateComponent(this.app, comp)
        }))

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
        return <GeneratorOutput>{
            files: [...typesFiles, ...componentFiles, ...pageFiles, appFile],
            errors: this.parser.allErrors(),
            get code() {
                return imports + typesConstants + this.files.map(f => `// ${f.name}\n${f.contents}`).join('\n')
            },
            html: this.htmlRunnerFile()
        }
    }

    private generateImports(app: BaseApp) {
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

        const functionImports = app.findChildElements(FunctionImport)
        return functionImports.length ? [`const {importModule, importHandlers} = Elemento`, ...functionImports.map(generateImport)] : []
    }

    private generateComponent(app: BaseApp, component: Page | BaseApp | Form | ListItem | ComponentDef, containingComponent?: Page | Form) {
        const componentIsApp = isAppLike(component)
        const componentIsListItem = component instanceof ListItem
        const componentIsForm = component instanceof Form
        const componentIsPage = component instanceof Page
        const canUseContainerElements = componentIsListItem && containingComponent
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
        const appContext = componentIsApp ? `    const appContext = Elemento.useGetAppContext()` : ''
        const getStateDeclaration = `    const _state = Elemento.useGetStore()`
        const appStateDeclaration = componentIsApp
            ? `    const app = _state.setObject('${app.codeName}', new App.State({pages, appContext}))`
            : appStateFunctionIdentifiers.length ? `    const app = _state.useObject('${app.codeName}')` : ''
        const appStateFunctionDeclarations = appStateFunctionIdentifiers.length ? `    const {${appStateFunctionIdentifiers.join(', ')}} = app` : ''
        const componentIdentifiersFound = this.parser.identifiersOfTypeComponent(component.id).map( comp => comp === 'Tool' ? 'App' : comp)
        const itemSetItemIdentifier = componentIsListItem ? ['ItemSetItem'] : []
        const componentIdentifiers = [...itemSetItemIdentifier, ...componentIdentifiersFound]
        const statefulComponents = allComponentElements.filter(el => el.type() === 'statefulUI' || el.type() === 'background')
        const statefulContainerComponents = allContainerElements.filter(el => el.type() === 'statefulUI' || el.type() === 'background')
        const isStatefulComponentName = (name: string) => statefulComponents.some(comp => comp.codeName === name)
        const isStatefulContainerComponentName = (name: string) => statefulContainerComponents.some(comp => comp.codeName === name)
        const componentDeclarations = componentIdentifiers.length ? `    const {${componentIdentifiers.map(runtimeElementTypeName).join(', ')}} = Elemento.components` : ''
        const globalFunctionIdentifiers = this.parser.globalFunctionIdentifiers(component.id)
        const globalDeclarations = globalFunctionIdentifiers.length ? `    const {${globalFunctionIdentifiers.join(', ')}} = Elemento.globalFunctions` : ''
        const appFunctionIdentifiers = this.parser.appFunctionIdentifiers(component.id)
        const appFunctionDeclarations = appFunctionIdentifiers.length ? `    const {${appFunctionIdentifiers.join(', ')}} = Elemento.appFunctions` : ''
        const toolsDeclarations = this.app.kind === 'Tool' ? `    const {Editor, Preview} = Elemento` : ''

        let appLevelDeclarations
        if (!componentIsApp) {
            const appLevelIdentifiers = identifiers.filter(isAppElement)
            appLevelDeclarations = appLevelIdentifiers.map(ident => `    const ${ident} = _state.useObject('${app.codeName}.${ident}')`).join('\n')
        }
        let containerDeclarations
        if (canUseContainerElements) {
            const containerIdentifiers = identifiers.filter(isContainerElement)
            containerDeclarations = containerIdentifiers.map(ident => `    const ${ident} = _state.useObject(parentPathWith('${ident}'))`).join('\n')
        }
        const elementoDeclarations = [componentDeclarations, globalDeclarations, toolsDeclarations, pages, appContext, appFunctionDeclarations, getStateDeclaration,
            appStateDeclaration, appStateFunctionDeclarations, appLevelDeclarations, containerDeclarations].filter(d => d !== '').join('\n').trimEnd()

        const actionHandler = (el: Element, def: PropertyDef) => {
            const actionDef = def.type as EventActionPropertyDef
            const functionCode = this.getExpr(el, def.name, 'action', actionDef.argumentNames)
            const wrappedFunctionCode = `wrapFn(pathTo('${el.codeName}'), '${def.name}', ${functionCode})`
            const functionName = `${el.codeName}_${def.name}`
            const identifiers = this.parser.statePropertyIdentifiers(el.id, def.name)
            const functionDependsOnIdentifier = (ident: string) => ident !== el.codeName &&
                (isStatefulComponentName(ident) || isStatefulContainerComponentName(ident)
                    || (componentIsForm && ident === '$form') || (componentIsListItem && ident === '$item'))
            const dependencies = identifiers.filter(functionDependsOnIdentifier)

            return functionCode && `    const ${functionName} = React.useCallback(${wrappedFunctionCode}, [${dependencies.join(', ')}])`
        }

        const functionDeclaration = (el: FunctionDef) => {
            const functionName = el.codeName
            const functionCode = this.getExpr(el, 'calculation', 'multilineExpression', el.inputs) ?? '() => {}'
            const wrappedFunctionCode = `wrapFn(pathTo('${el.codeName}'), 'calculation', ${functionCode})`
            const identifiers = this.parser.statePropertyIdentifiers(el.id, 'calculation')
            const functionDependsOnIdentifier = (ident: string) => ident !== el.codeName &&
                (isStatefulComponentName(ident) || isStatefulContainerComponentName(ident)
                    || (componentIsForm && ident === '$form') || (componentIsListItem && ident === '$item'))
            const dependencies = identifiers.filter(functionDependsOnIdentifier)
            return `    const ${functionName} = React.useCallback(${wrappedFunctionCode}, [${dependencies.join(', ')}])`
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

        const stateInitializers = statefulComponents.map((el): StateInitializer => {
            const initState = this.initialState(el, topLevelFunctions, componentIsListItem ? component.itemSet : component)
            const identifiers = this.parser.stateIdentifiers(el.id)
            const stateComponentIdentifiersUsed = identifiers.filter(id => isStatefulComponentName(id) && id !== el.codeName)
            return [el, initState, stateComponentIdentifiersUsed]
        }).filter(([, initState]) => !!initState)

        const inlineStateBlock = () => topoSort(stateInitializers).map(([el, initState]) => {
            const name = el.codeName
            const pathExpr = componentIsApp ? `'${app.codeName}.${name}'` : `pathTo('${name}')`
            if (initState instanceof FunctionDef) {
                return functionDeclaration(initState)
            } else {
                const actionFunctions = stateActionHandlers(el).filter( notBlank ).join('\n')
                const stateObjectDeclaration = `    const ${name} = _state.setObject(${pathExpr}, ${initState})`
                return [actionFunctions, stateObjectDeclaration].filter( notBlank ).join('\n')
            }
        }).join('\n')

        const formState = () => {
            return `    const \$form = _state.useObject(props.path)` + '\n'
                 + inlineStateBlock() + '\n'
                 + `    \$form._updateValue()`

        }

        const stateBlock = componentIsForm ? formState() : inlineStateBlock()

        const backgroundFixedComponents = componentIsApp ? component.otherComponents.filter(comp => comp.type() === 'backgroundFixed') : []
        const backgroundFixedDeclarations = backgroundFixedComponents.map(comp => {
            const entry = this.initialState(comp, topLevelFunctions, componentIsListItem ? component.itemSet : component)
            return `    const [${comp.codeName}] = React.useState(${entry})`
        }).join('\n')

        const pathTo = componentIsApp ? `    const pathTo = name => '${component.codeName}' + '.' + name`
            : `    const pathTo = name => props.path + '.' + name`
        const parentPathWith = canUseContainerElements ? `    const parentPathWith = name => Elemento.parentPath(props.path) + '.' + name` : ''

        const extraDeclarations = componentIsListItem ? '    const {$item, $itemId, $selected, onClick} = props' : ''
        const dragFunctionIdentifiers = this.parser.dragFunctionIdentifiers(component.id)
        const dragFunctionDeclarations =
            dragFunctionIdentifiers.length ? `    const {${dragFunctionIdentifiers.join(', ')}} = Elemento.dragFunctions()` : ''
        const uiElementActionFunctions = generateActionHandlers(allComponentElements, uiElementActionHandlers)
        const functionNamePrefix = this.functionNamePrefix(containingComponent)
        const functionName = functionNamePrefix + (componentIsListItem ? component.itemSet.codeName + 'Item' : component.codeName)

        const canDragDeclaration = componentIsListItem ? `    const canDragItem = ${this.getExpr(component.itemSet, 'canDragItem')}` : ''
        const stylesDeclaration = componentIsListItem ? `    const styles = ${this.getExpr(component.itemSet, 'itemStyles')}` : ''
        const listItemVarDeclarations = [canDragDeclaration, stylesDeclaration].filter(s => !!s).join('\n')

        const declarations = [
            pathTo, parentPathWith, extraDeclarations, dragFunctionDeclarations, elementoDeclarations,
            backgroundFixedDeclarations, stateBlock, uiElementActionFunctions, listItemVarDeclarations
        ].filter(d => d !== '').join('\n')
        const exportClause = componentIsApp ? 'export default ' : ''
        const debugHook = componentIsPage  ? `\n    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))` : ''
        const notLoggedInPage = componentIsPage && component.notLoggedInPage ? `\n${functionName}.notLoggedInPage = '${component.notLoggedInPage.expr}'` : ''

        const functionCode = `function ${functionName}(props) {
${declarations}${debugHook}

    return ${uiElementCode}
}`
        const wrappedFunction = componentIsListItem ? `const ${functionName} = React.memo(${functionCode})` : functionCode
        const componentFunction = `${exportClause}${wrappedFunction}${notLoggedInPage}
`.trimStart()

        const stateNames = statefulComponents.filter( el => el.kind !== 'Calculation').map( el => el.codeName )
        const stateClass = componentIsForm ? `${functionName}.State = class ${functionName}_State extends Elemento.components.BaseFormState {
    ownFieldNames = [${stateNames.map(quote).join(', ')}]
}
`.trimStart() : ''

        return [...topLevelFunctions, componentFunction, stateClass].filter(identity).join('\n\n')
    }

    generateStandaloneBlock(selectedElement: Element | null, exprs: {[name: string] : string}, containingComponent: Page | App, updatesAllowed: string[]): [string, DebugErrors] {
        const exprId = '_standalone'
        this.parser.parseStandaloneExpr(exprId, exprs, containingComponent)
        const standaloneErrors = (this.parser.allErrors()[exprId] ?? {}) as DebugErrors
        const allContainerElements = allElements(containingComponent, true)
        const isAppElement = (name: string) => !!this.app.otherComponents.find( el => el.codeName === name && el.kind !== 'FunctionImport' )
        const isContainerElement = (name: string) => !!allContainerElements.find(el => el.codeName === name )
        const identifiers = this.parser.componentIdentifiers(exprId)

        const selectedElementDeclaration = selectedElement ? `const _selectedElement = _state.getObject('${this.project.findElementPath(selectedElement.id)}')` :''
        const appCodeName = this.app.codeName
        const appStateFunctionIdentifiers = this.parser.appStateFunctionIdentifiers(exprId)
        const appStateDeclaration = appStateFunctionIdentifiers.length ? `const app = _state.getObject('${appCodeName}')` : ''
        const appStateFunctionDeclarations = appStateFunctionIdentifiers.length ? `const {${appStateFunctionIdentifiers.join(', ')}} = app` : ''
        const globalFunctionIdentifiers = this.parser.globalFunctionIdentifiers(exprId)
        const globalDeclarations = globalFunctionIdentifiers.length ? `const {${globalFunctionIdentifiers.join(', ')}} = Elemento.globalFunctions` : ''
        const appFunctionIdentifiers = this.parser.appFunctionIdentifiers(exprId)
        const appFunctionDeclarations = appFunctionIdentifiers.length ? `const {${appFunctionIdentifiers.join(', ')}} = Elemento.appFunctions` : ''

        let appLevelDeclarations
        const appLevelIdentifiers = identifiers.filter(isAppElement)
        appLevelDeclarations = appLevelIdentifiers.map(ident => `const ${ident} = _state.getObject('appCodeName.${ident}')`).join('\n')
        let containerDeclarations
        const containerIdentifiers = identifiers.filter(isContainerElement)
        containerDeclarations = containerIdentifiers.map(ident => `const ${ident} = _state.getObject(pathTo('${ident}'))`).join('\n')
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
        const propertyDefs = this.project.propertyDefsOf(element).filter(def => !def.state)
        const propertyExprs = propertyDefs.map(def => {
            const exprType: ExprType = isActionProperty(def) ? 'reference' : 'singleExpression'
            const expr = this.getExprWithoutParens(element, def.name, exprType)
            return [def.name, expr]
        })

        return Object.fromEntries(propertyExprs.filter(([, expr]) => !!expr))
    }

    private generateComponentCode(element: Element | ListItem, app: BaseApp, topLevelFunctions: FunctionCollector): string {

        const generateChildren = (element: Element, indent: string = indentLevel2, containingComponent?: Page | Form) => {
            const elementArray = element.elements ?? []
            const generatedUiElements = elementArray.map(p => this.generateElement(p, app, topLevelFunctions, containingComponent))
            const generatedUiElementLines = generatedUiElements.filter(line => !!line).map(line => `${indent}${line},`)
            return generatedUiElementLines.join('\n')
        }

        if (element instanceof ListItem) {
            return `React.createElement(ItemSetItem, {path: props.path, item: $item, itemId: $itemId, onClick, canDragItem, styles},
${generateChildren(element.itemSet)}
    )`
        }

        switch (element.kind) {
            case 'App':
            case 'Tool': {
                const app = element as App
                const topChildrenElements = app.topChildren.map(p => `${this.generateElement(p, app, topLevelFunctions)}`).filter(line => !!line.trim()).join(',\n')
                const topChildren = topChildrenElements.length ? `, topChildren: React.createElement( React.Fragment, null, ${topChildrenElements})\n    ` : ''
                const bottomChildrenElements = app.bottomChildren.map(p => `        ${this.generateElement(p, app, topLevelFunctions)}`).filter(line => !!line.trim()).join(',\n')
                const bottomChildren = bottomChildrenElements ? `\n${bottomChildrenElements}\n    ` : ''
                const fontProp = app.fontList.length ? {fonts: `[${app.fontList.map(quote).join(', ')}]`} : {}
                const propsEntries = {...omit(['fonts'], this.modelProperties(app)), ...fontProp}
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

    private generateElement(element: Element, app: BaseApp, topLevelFunctions: FunctionCollector, containingComponent?: Page | Form): string {

        const generateChildren = (element: Element, indent: string = indentLevel2, containingComponent?: Page | Form) => {
            const elementArray = element.elements ?? []
            const generatedUiElements = elementArray.map(p => this.generateElement(p, app, topLevelFunctions, containingComponent))
            const lines = generatedUiElements.filter(line => !!line).map(line => `${indent}${line},`)
            return lines.length ?  `,\n${lines.join('\n')}\n    ` : ''
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
                const text = element as Text
                const content = this.getExpr(text, 'content')
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
                const itemSet = element as ItemSet
                const itemCode = this.generateComponent(app, new ListItem(itemSet), containingComponent)
                topLevelFunctions.add(itemCode)
                const itemContentComponent = containingComponent!.codeName + '_' + itemSet.codeName + 'Item'

                const modelProperties = omit(['canDragItem', 'itemStyles'], this.modelProperties(element))  // used in the item content component
                const reactProperties = {itemContentComponent, ...modelProperties}
                return `React.createElement(${runtimeElementName(element)}, ${objectBuilder(element.codeName, reactProperties)})`
            }

            case 'Form': {
                const form = element as Form
                const formCode = this.generateComponent(app, form, containingComponent)
                topLevelFunctions.add(formCode)
                const formComponentName = containingComponent!.codeName + '_' + form.codeName

                return `React.createElement(${formComponentName}, ${objectBuilder(element.codeName, this.modelProperties(element))})`
            }

            case 'MemoryDataStore':
            case 'FileDataStore':
            case 'BrowserDataStore':
            case 'FirestoreDataStore':
            case 'Function':
            case 'FunctionImport':
            case 'Component':
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
            if (def.name === 'initialValue') return 'value'
            // see CalculationState for reason for this conversion
            if (element.kind === 'Calculation' && def.name === 'calculation') return 'value'
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
                props.value = `\$form.originalValue?.${element.codeName}`
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

        if (element.type() === 'statefulUI' || element.type() === 'background') {
            const builderName = isAppLike(containingElement) ? {fullName: `'${containingElement.codeName}.${element.codeName}'`} : element.codeName
            return `new ${runtimeElementName(element)}.State(${objectBuilder(builderName, modelProperties(), true)})`
        }

        if (element.type() === 'backgroundFixed') {
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
                    params: fn.inputs,
                    action: true
                } : {params: fn.inputs}

                const serverUrlExpr = this.getExprWithoutParens(connector, 'serverUrl')
                configExpr = `{
                appName: '${serverApp.name}',
                url: ${serverUrlExpr || `'/capi/:versionId/${serverApp.codeName}'`},
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

        const getExprCode = (propertyValue: PropertyValue | undefined, error: PropertyError)=> {
            const isIncompleteItemError = (errorMessage: PropertyError) => errorMessage && typeof errorMessage === 'string' && errorMessage.startsWith('Incomplete item')
            if (error && (typeof error === 'string') && !isIncompleteItemError(error)) {
                return `Elemento.codeGenerationError(\`${this.parser.getExpression(propertyValue)}\`, '${error}')`
            }

            const ast = this.parser.getAst(propertyValue)
            if (ast === undefined) {
                return undefined
            }
            const isJavascriptFunctionBody = element.kind === 'Function' && propertyName === 'calculation' && (element as FunctionDef).javascript
            if (!isJavascriptFunctionBody) {
                convertAstToValidJavaScript(ast, exprType, ['action'])
            }

            const exprCode = printAst(ast)

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
                    const argList = (argumentNames ?? []).join(', ')
                    const body = exprCode
                    const asyncPrefix = body.match(/\bawait\b/) ? 'async ' : ''
                    return exprCode.trim() ? `${asyncPrefix}(${argList}) => {\n${indent(body, '        ')}\n    }` : '() => {}'
                }
                case 'reference': {
                    return `${element.codeName}_${propertyName}`
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

    private getExprWithoutParens(element: Element, propertyName: string, exprType: ExprType = 'singleExpression') {
        return trimParens(this.getExpr(element, propertyName, exprType))
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
    #main { height: calc(100vh - 8px); width: calc(100vw - 8px); margin: 4px }
  </style>
</head>
<body>
<script type="module">
    window.elementoRuntimeUrl = (location.host.match(/^localhost:/)) ? location.origin + '/lib/runtime.js' : 'https://elemento.online/lib/runtime.js'
    import(window.elementoRuntimeUrl).then( runtime => runtime.runAppFromWindowUrl() )
</script>
</body>
</html>
`
    }
}
