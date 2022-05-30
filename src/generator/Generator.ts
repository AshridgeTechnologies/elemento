import {parse, print} from 'recast'
import {visit,} from 'ast-types'

import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'
import Element from '../model/Element'
import TextInput from '../model/TextInput'
import {globalFunctions} from '../runtime/globalFunctions'
import * as components from '../runtime/components'
import {appFunctionsNames} from '../runtime/appFunctions'
import UnsupportedValueError from '../util/UnsupportedValueError'
import {definedPropertiesOf, isExpr} from '../util/helpers'
import {ElementId, PropertyValue} from '../model/Types'
import Button from '../model/Button'
import NumberInput from '../model/NumberInput'
import SelectInput from '../model/SelectInput'
import TrueFalseInput from '../model/TrueFalseInput'
import List from '../model/List'
import {isArray, isPlainObject} from 'lodash'
import {uniq} from 'ramda'
import Data from '../model/Data'
import {Collection} from '../model/index'
import MemoryDataStore from '../model/MemoryDataStore'
import FileDataStore from '../model/FileDataStore'
import Layout from '../model/Layout'

type IdentifierCollector = {add(s: string): void}
type FunctionCollector = {add(s: string): void}
interface ErrorCollector {
    add(elementId: ElementId, propertyName: string, error: string): void
}

function safeKey(name: string) { return name.match(/\W/) ? `'${name}'` : name}
function objectLiteral(obj: object) {
    return `{${Object.entries(obj).map(([name, val]) => `${safeKey(name)}: ${val}`).join(', ')}}`
}

const appFunctions = appFunctionsNames()
const isAction = true
const isComponent = (name: string) => name in components
const isGlobalFunction = (name: string) => name in globalFunctions
const isAppFunction = (name: string) => appFunctions.includes(name)
const isBuiltIn = (name: string) => ['undefined', 'null'].includes(name)
const isItemVar = (name: string) => name === '$item'
const trimParens = (expr?: string) => expr?.startsWith('(') ? expr.replace(/^\(|\)$/g, '') : expr

class Ref {
    constructor(
        public ref: string
    ) {}
}

const valueLiteral = function (propertyValue: any): string {
    if (isPlainObject(propertyValue)) {
        return `{${Object.entries(propertyValue).map(([name, val]) => `${name}: ${valueLiteral(val)}`).join(', ')}}`
    } else if (isArray(propertyValue)) {
        return `[${propertyValue.map(valueLiteral).join(', ')}]`
    } else if (propertyValue instanceof Ref) {
        return propertyValue.ref
    } else if (typeof propertyValue === 'string') {
        return propertyValue.includes('\n') ? `\`${propertyValue}\`` : `'${propertyValue}'`
    } else {
        return String(propertyValue)
    }
}

export function generate(app: App) {
    return new Generator(app).output()
}

export default class Generator {
    constructor(public app: App) {
    }

    output() {
        type ElementErrors = {[propertyName: string]: string}
        type AllErrors = {[elementId: ElementId]: ElementErrors}
        const errorCollector = {
            errors: {} as AllErrors,
            add(elementId: ElementId, propertyName: string, error: string) {
                if (!(elementId in this.errors)) {
                    this.errors[elementId] = {}
                }

                this.errors[elementId][propertyName] = error
            }
        }
        const pageFiles = this.app.pages.map( page => ({
            name: `${(page.codeName)}.js`,
            content: Generator.pageComponent(this.app, page, errorCollector)
        }))
        const appMainFile = {
            name: 'appMain.js',
            content: 'export default ' + Generator.appMainComponent(this.app, errorCollector)
        }

        const imports = 'import React from \'react\'\nimport Elemento from \'elemento-runtime\'\n\n'
        return {
            files: [...pageFiles, appMainFile],
            errors: errorCollector.errors,
            get code() {
                return imports + this.files.map( f => `// ${f.name}\n${f.content}` ).join('\n')
            }
        }
    }

    private static listItemComponent(list: List, errors: ErrorCollector) {
        const name = list.codeName + 'Item'
        const identifierSet = new Set<string>()
        const topLevelFunctions = new Set<string>()
        const isKnown = (name: string) => isGlobalFunction(name) || isAppFunction(name) || isBuiltIn(name) || isItemVar(name)
        const children = list.elementArray().map(p => `        ${Generator.generateElement(p, identifierSet, topLevelFunctions, isKnown, errors)},`).join('\n')

        const identifiers = [...identifierSet.values()]
        const componentIdentifiers = identifiers.filter(isComponent)
        const componentDeclarations = componentIdentifiers.length ? `    const {${componentIdentifiers.join(', ')}} = Elemento.components` : ''
        const globalFunctionIdentifiers = identifiers.filter(isGlobalFunction)
        const globalDeclarations = globalFunctionIdentifiers.length ? `    const {${globalFunctionIdentifiers.join(', ')}} = Elemento.globalFunctions` : ''
        const elementoDeclarations = [componentDeclarations, globalDeclarations].filter( d => d !== '').join('\n').trimEnd()

        const code = `function ${name}(props) {
    const pathWith = name => props.path + '.' + name
    const {$item} = props
${elementoDeclarations}

    return React.createElement(React.Fragment, null,
${children}
    )
}`

        return [name, code]
    }

    private static pageComponent(app: App, page: Page, errors: ErrorCollector) {
        const identifierSet = new Set<string>()
        const topLevelFunctions = new Set<string>()
        const allPageElements = page.allElements()
        const isAppElement = (name: string) => !!app.otherComponents.find( el => el.codeName === name )
        const isPageElement = (name: string) => !!allPageElements.find(el => el.codeName === name )
        const isPageName = (name: string) => !!app.pages.find( p => p.codeName === name )
        const isKnown = (name: string) => isGlobalFunction(name) || isAppFunction(name) || isPageElement(name) || isPageName(name) || isAppElement(name) || isBuiltIn(name)
        const pageUiElementCode = Generator.generateElement(page, identifierSet, topLevelFunctions, isKnown, errors)
        const identifiers = [...identifierSet.values()]

        const componentIdentifiers = identifiers.filter(isComponent)
        const componentDeclarations = componentIdentifiers.length ? `    const {${componentIdentifiers.join(', ')}} = Elemento.components` : ''
        const globalFunctionIdentifiers = identifiers.filter(isGlobalFunction)
        const globalDeclarations = globalFunctionIdentifiers.length ? `    const {${globalFunctionIdentifiers.join(', ')}} = Elemento.globalFunctions` : ''
        const appFunctionIdentifiers = identifiers.filter(isAppFunction)
        const appFunctionDeclarations = appFunctionIdentifiers.length ? `    const {${appFunctionIdentifiers.join(', ')}} = Elemento.appFunctions()` : ''
        const appLevelIdentifiers = identifiers.filter(isAppElement)
        const appLevelDeclarations = appLevelIdentifiers.map( ident => `    const ${ident} = Elemento.useObjectStateWithDefaults('app.${ident}')`).join('\n')
        const elementoDeclarations = [componentDeclarations, globalDeclarations, appFunctionDeclarations, appLevelDeclarations].filter( d => d !== '').join('\n').trimEnd()

        const stateEntries = allPageElements.map( el => [el.codeName, Generator.initialStateEntry(el, isKnown)] ).filter( ([,entry]) => !!entry )
        const stateBlock = stateEntries.map( ([name, entry]) =>
            `    const ${name} = Elemento.useObjectStateWithDefaults(pathWith('${name}'), ${entry})`).join('\n')

        const pageNames = identifiers.filter(isPageName)
        const pageNameDeclarations = pageNames.length ? `    const ${pageNames.map( p => `${p} = '${p}'` ).join(', ')}` : ''
        const localDeclarations = [pageNameDeclarations].filter( d => d !== '').join('\n').trimEnd()

        const pageFunction = `function ${page.codeName}(props) {
    const pathWith = name => props.path + '.' + name
${elementoDeclarations}
${stateBlock}
${localDeclarations}
    return ${pageUiElementCode}
}
`.trimStart()
        return [...topLevelFunctions, pageFunction].join('\n\n')
    }

    private static appMainComponent(app: App, errors: ErrorCollector) {
        const identifierSet = new Set<string>()
        const topLevelFunctions = new Set<string>()
        const isPageElement = (name: string) => !!app.otherComponents.find( el => el.codeName === name )
        const isKnown = (name: string) => isGlobalFunction(name) || isAppFunction(name) || isPageElement(name) || isBuiltIn(name)
        const code = Generator.generateElement(app, identifierSet, topLevelFunctions, isKnown, errors)
        const identifiers = [...identifierSet.values()]

        const componentIdentifiers = identifiers.filter(isComponent)
        const componentDeclarations = componentIdentifiers.length ? `    const {${componentIdentifiers.join(', ')}} = Elemento.components` : ''
        const globalFunctionIdentifiers = identifiers.filter( id => isGlobalFunction(id))
        const globalDeclarations = globalFunctionIdentifiers.length ? `    const {${globalFunctionIdentifiers.join(', ')}} = Elemento.globalFunctions` : ''
        const elementoDeclarations = [componentDeclarations, globalDeclarations].filter( d => d !== '').join('\n').trimEnd()

        const statefulComponents = app.otherComponents.filter( el => el.componentType === 'statefulUI' || el.componentType === 'background')
        const stateDefaultEntries = statefulComponents.map( el => [el.codeName, Generator.initialStateEntry(el, isKnown)] ).filter( ([,entry]) => !!entry )
        const stateDefaultBlock = stateDefaultEntries.map( ([name, entry]) =>
            `    const ${name} = Elemento.useObjectStateWithDefaults('app.${name}', ${entry})`).join('\n')

        const backgroundFixedComponents = app.otherComponents.filter( comp => comp.componentType === 'backgroundFixed')
        const backgroundFixedDeclarations = backgroundFixedComponents.map( comp => `    const [${comp.codeName}] = React.useState(${Generator.initialStateEntry(comp, isKnown)})`).join('\n')
        const localDeclarations = [].filter( d => d !== '').join('\n').trimEnd()

        return `function AppMain(props) {
${elementoDeclarations}
    const appPages = {${app.pages.map(p => p.codeName).join(', ')}}
${backgroundFixedDeclarations}
${stateDefaultBlock}
${localDeclarations}
${code}
`.trimStart()
    }

    private static generateElement(element: Element, identifiers: IdentifierCollector, topLevelFunctions: FunctionCollector, isKnown: (name: string) => boolean, errors: ErrorCollector): string {

        const onError = (propertyName: string) => (err: string) => errors.add(element.id, propertyName, err)

        const pathWith = (name: string) => `pathWith('${name}')`

        switch(element.kind) {
            case 'Project':
                throw new Error('Cannot generate code for Project')
            case 'App': {
                const app = element as App
                const children = app.otherComponents.map(p => `        ${Generator.generateElement(p, identifiers, topLevelFunctions, isKnown, errors)}`).filter( line => !!line.trim()).join(',\n')
                return `    const appState = Elemento.useObjectStateWithDefaults('app._data', {currentPage: Object.keys(appPages)[0]})
    const {currentPage} = appState
    return React.createElement('div', {id: '${app.codeName}'},
        React.createElement(appPages[currentPage], {path: \`${app.codeName}.\${currentPage}\`}),
${children}
    )
}`
            }

        case 'Page': {
            const page = element as Page
            identifiers.add('Page')
            const children = page.elementArray().map(p => `        ${Generator.generateElement(p, identifiers, topLevelFunctions, isKnown, errors)},`).join('\n')
            return `React.createElement(Page, {id: props.path},
${children}
    )`
        }

        case 'Layout': {
            const layout = element as Layout
            const path = pathWith(layout.codeName)
            identifiers.add('Layout')
            const children = layout.elementArray().map(p => `            ${Generator.generateElement(p, identifiers, topLevelFunctions, isKnown, errors)},`).join('\n')
            const horizontal = Generator.getExprAndIdentifiers(layout.horizontal, identifiers, isKnown, onError('horizontal'))
            const width = Generator.getExprAndIdentifiers(layout.width, identifiers, isKnown, onError('width'))
            const wrap = Generator.getExprAndIdentifiers(layout.wrap, identifiers, isKnown, onError('wrap'))
            const reactProperties = definedPropertiesOf({path, horizontal, width, wrap})
            return `React.createElement(Layout, ${objectLiteral(reactProperties)},
${children}
    )`
        }

        case 'Text': {
            const text = element as Text
            identifiers.add('TextElement')
            const path = pathWith(text.codeName)
            const content = Generator.getExprAndIdentifiers(text.content, identifiers, isKnown, onError('content'))
            const fontSize = Generator.getExprAndIdentifiers(text.fontSize, identifiers, isKnown, onError('fontSize'))
            const fontFamily = Generator.getExprAndIdentifiers(text.fontFamily, identifiers, isKnown, onError('fontFamily'))
            const color = Generator.getExprAndIdentifiers(text.color, identifiers, isKnown, onError('color'))
            const backgroundColor = Generator.getExprAndIdentifiers(text.backgroundColor, identifiers, isKnown, onError('backgroundColor'))
            const border = Generator.getExprAndIdentifiers(text.border, identifiers, isKnown, onError('border'))
            const borderColor = Generator.getExprAndIdentifiers(text.borderColor, identifiers, isKnown, onError('borderColor'))
            const width = Generator.getExprAndIdentifiers(text.width, identifiers, isKnown, onError('width'))
            const height = Generator.getExprAndIdentifiers(text.height, identifiers, isKnown, onError('height'))
            const reactProperties = definedPropertiesOf({path, fontSize, fontFamily, color, backgroundColor, border, borderColor, width, height})
            return `React.createElement(TextElement, ${objectLiteral(reactProperties)}, ${content})`
        }

        case 'TextInput':
            const textInput = element as TextInput
            identifiers.add('TextInput')
            const initialValue = Generator.getExprAndIdentifiers(textInput.initialValue, identifiers, isKnown, onError('initialValue'))
            const state = textInput.codeName
            const maxLength = Generator.getExprAndIdentifiers(textInput.maxLength, identifiers, isKnown, onError('maxLength'))
            const width = Generator.getExprAndIdentifiers(textInput.width, identifiers, isKnown, onError('width'))
            const multiline = Generator.getExprAndIdentifiers(textInput.multiline, identifiers, isKnown, onError('multiline'))
            const label = Generator.getExprAndIdentifiers(textInput.label, identifiers, isKnown, onError('label'))
            const reactProperties = definedPropertiesOf({state, maxLength, multiline, label, width})
            return `React.createElement(TextInput, ${objectLiteral(reactProperties)})`

        case 'NumberInput': {
            const numberInput = element as NumberInput
            identifiers.add('NumberInput')
            const initialValue = Generator.getExprAndIdentifiers(numberInput.initialValue, identifiers, isKnown, onError('initialValue'))
            const state = numberInput.codeName
            const label = Generator.getExprAndIdentifiers(numberInput.label, identifiers, isKnown, onError('label'))
            const reactProperties = definedPropertiesOf({state, label})
            return `React.createElement(NumberInput, ${objectLiteral(reactProperties)})`
        }

        case 'SelectInput': {
            const selectInput = element as SelectInput
            identifiers.add('SelectInput')
            const values = Generator.getExprAndIdentifiers(selectInput.values, identifiers, isKnown, onError('values'))
            const initialValue = Generator.getExprAndIdentifiers(selectInput.initialValue, identifiers, isKnown, onError('initialValue'))
            const state = selectInput.codeName
            const label = Generator.getExprAndIdentifiers(selectInput.label, identifiers, isKnown, onError('label'))
            const reactProperties = definedPropertiesOf({state, values, label})
            return `React.createElement(SelectInput, ${objectLiteral(reactProperties)})`
        }

        case 'TrueFalseInput': {
            const trueFalseInput = element as TrueFalseInput
            identifiers.add('TrueFalseInput')
            const initialValue = Generator.getExprAndIdentifiers(trueFalseInput.initialValue, identifiers, isKnown, onError('initialValue'))
            const state = trueFalseInput.codeName
            const label = Generator.getExprAndIdentifiers(trueFalseInput.label, identifiers, isKnown, onError('label'))
            const reactProperties = definedPropertiesOf({state, label})
            return `React.createElement(TrueFalseInput, ${objectLiteral(reactProperties)})`
        }

        case 'Button': {
            const button = element as Button
            identifiers.add('Button')
            const path = pathWith(button.codeName)
            const content = Generator.getExprAndIdentifiers(button.content, identifiers, isKnown, onError('content'))
            const action = Generator.getExprAndIdentifiers(button.action, identifiers, isKnown, onError('action'), isAction)
            const reactProperties = definedPropertiesOf({path, content, action})
            return `React.createElement(Button, ${objectLiteral(reactProperties)})`
        }

        case 'List': {
            const list = element as List
            identifiers.add('ListElement')
            const items = Generator.getExprAndIdentifiers(list.items, identifiers, isKnown, onError('items')) ?? '[]'
            const state = list.codeName
            const [itemContentComponent, listItemCode] = Generator.listItemComponent(list, errors)
            const width = Generator.getExprAndIdentifiers(list.width, identifiers, isKnown, onError('width'))
            const style = Generator.getExprAndIdentifiers(list.style, identifiers, isKnown, onError('style'))

            topLevelFunctions.add(listItemCode)
            const reactProperties = definedPropertiesOf({state, items, itemContentComponent, width, style})
            return `React.createElement(ListElement, ${objectLiteral(reactProperties)})`
        }

        case 'Data': {
            const data = element as Data
            identifiers.add('Data')
            const initialValue = Generator.getExprAndIdentifiers(data.initialValue, identifiers, isKnown, onError('initialValue'))
            const state = data.codeName
            const display = Generator.getExprAndIdentifiers(data.display, identifiers, isKnown, onError('display'))
            const reactProperties = definedPropertiesOf({state, display})
            return `React.createElement(Data, ${objectLiteral(reactProperties)})`
        }

        case 'Collection': {
            const collection = element as Collection
            identifiers.add(element.kind)
            const initialValue = Generator.getExprAndIdentifiers(collection.initialValue, identifiers, isKnown, onError('initialValue'))
            const state = collection.codeName
            const display = Generator.getExprAndIdentifiers(collection.display, identifiers, isKnown, onError('display'))
            const dataStore = Generator.getExprAndIdentifiers(collection.dataStore, identifiers, isKnown, onError('dataStore'))
            const collectionName = Generator.getExprAndIdentifiers(collection.collectionName, identifiers, isKnown, onError('collectionName'))
            const reactProperties = definedPropertiesOf({state, display/*, dataStore, collectionName*/})
            return `React.createElement(Collection, ${objectLiteral(reactProperties)})`
        }

        case 'MemoryDataStore': {
            identifiers.add(element.kind)
            return ''
        }

        case 'FileDataStore': {
            identifiers.add(element.kind)
            return ''
        }

        default:
            throw new UnsupportedValueError(element.kind)
        }
    }

    private static initialStateEntry(element: Element, isKnown: (name: string) => boolean): string {
        function ifDefined(name: string, expr: string | boolean | undefined) {
            return expr ? name + ': ' + expr + ', ' : ''
        }
        function valueAndTypeEntry<T extends TextInput | NumberInput | SelectInput | TrueFalseInput>(element: Element) {
            const input = element as T
            const [valueExpr] = Generator.getExpr(input.initialValue, isKnown)
            return `{${ifDefined('value', valueExpr)}_type: ${input.kind}.State},`
        }

        switch (element.kind) {
            case 'Project':
                throw new Error('Cannot generate code for Project')
            case 'App':
            case 'Page':
            case 'Layout':
            case 'Text':
            case 'Button':
                return ''

            case 'TextInput':
            case 'SelectInput':
            case 'TrueFalseInput':
            case 'NumberInput':
            case 'Data':
                return valueAndTypeEntry(element)

            case 'Collection': {
                const collection = element as Collection
                const [valueExpr] = Generator.getExpr(collection.initialValue, isKnown)
                const [dataStoreExpr] = Generator.getExpr(collection.dataStore, isKnown)
                const [collectionNameExpr] = Generator.getExpr(collection.collectionName, isKnown)
                return `{${ifDefined('value', valueExpr)}${ifDefined('dataStore', dataStoreExpr)}${ifDefined('collectionName', collectionNameExpr)}_type: ${collection.kind}.State},`
            }
            case 'List': {
                const list = element as List
                const [itemsExpr] = Generator.getExpr(list.items, isKnown)
                return `{${ifDefined('value', itemsExpr)}_type: ListElement.State},`
            }
            case 'MemoryDataStore':
                const store = element as MemoryDataStore
                const [valueExpr] = Generator.getExpr(store.initialValue, isKnown)
                return `new MemoryDataStore({${valueExpr ? 'value: ' + valueExpr : ''}})`

            case 'FileDataStore':
                const fileStore = element as FileDataStore
                return `{_type: ${fileStore.kind}.State}`

            default:
                throw new UnsupportedValueError(element.kind)
        }
    }

    private static getExprAndIdentifiers(propertyValue: PropertyValue | undefined, identifiers: IdentifierCollector,
        isKnown: (name: string) => boolean,
        onError: (err: string) => void, isAction = false) {
        if (propertyValue === undefined) {
            return undefined
        }

        function checkIsExpression(ast: any) {
            const bodyStatements = ast.program.body as any[]
            if (bodyStatements.length !== 1) {
                throw new Error('Must be a single expression')
            }
            const mainStatement = bodyStatements[0]
            if (mainStatement.type !== 'ExpressionStatement') {
                throw new Error('Invalid expression')
            }
        }

        function checkErrors(ast: any) {
            if (ast.program.errors?.length) {
                throw new Error(ast.program.errors[0].description)
            }
        }

        function isShorthandProperty(node: any) {
            return node.shorthand
        }

        if (isExpr(propertyValue)) {
            const {expr} = propertyValue
            try {
                const exprToParse = expr.trim().startsWith('{') ? `(${expr})` : expr
                const ast = parse(exprToParse)
                checkIsExpression(ast)
                checkErrors(ast)
                const thisIdentifiers = new Set<string>()
                visit(ast, {
                    visitIdentifier(path) {
                        const node = path.value
                        const parentNode = path.parentPath.value
                        const isPropertyIdentifier = parentNode.type === 'MemberExpression' && parentNode.property === node
                        const isPropertyKey = parentNode.type === 'Property' && parentNode.key === node
                        if (!isPropertyIdentifier && !isPropertyKey) {
                            thisIdentifiers.add(node.name)
                        }
                        this.traverse(path)
                    },
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
                            const errorMessage = `Incomplete item: ${node.key.name}`
                            onError(errorMessage)
                        }
                        this.traverse(path)
                    }
                })

                const identifierNames = Array.from(thisIdentifiers.values())
                const unknownIdentifiers = identifierNames.filter(id => !isKnown(id))
                if (unknownIdentifiers.length) {
                    const errorMessage = `Unknown names: ${unknownIdentifiers.join(', ')}`
                    onError(errorMessage)
                    return `Elemento.codeGenerationError(\`${expr}\`, '${errorMessage}')`
                }

                identifierNames.forEach(name => identifiers.add(name))

                const exprCode = print(ast).code
                return isAction ? `() => {${exprCode}}` : exprCode
            } catch(e: any) {
                const errorMessage = `${e.constructor.name}: ${e.message}`
                onError(errorMessage)
                return `Elemento.codeGenerationError(\`${expr}\`, '${errorMessage}')`
            }
        } else {
            return valueLiteral(propertyValue)
        }
    }

    private static getExpr(propertyValue: PropertyValue | undefined, isKnown: (name: string) => boolean) {
        const identifiers = new Set()
        const errors = []
        const onError = (err: string) => errors.push(err)
        const expr = trimParens(Generator.getExprAndIdentifiers(propertyValue, identifiers, isKnown, onError))
        const isError = !!errors.length

        return [expr, isError]
    }
}