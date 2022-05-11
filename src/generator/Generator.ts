import {parse, print} from 'recast'
import {visit,} from 'ast-types'

import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'
import Element from '../model/Element'
import TextInput from '../model/TextInput'
import {globalFunctions} from '../runtime/globalFunctions'
import * as components from '../runtime/components'
import appFunctions from '../runtime/appFunctions'
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

type IdentifierCollector = {add(s: string): void}
type FunctionCollector = {add(s: string): void}
interface ErrorCollector {
    add(elementId: ElementId, propertyName: string, error: string): void
}

function safeKey(name: string) { return name.match(/\W/) ? `'${name}'` : name}
function objectLiteral(obj: object) {
    return `{${Object.entries(obj).map(([name, val]) => `${safeKey(name)}: ${val}`).join(', ')}}`
}

const appFunctionsObj = appFunctions({_updateApp() {}})
const isAction = true
const isComponent = (name: string) => name in components
const isGlobalFunction = (name: string) => name in globalFunctions
const isAppFunction = (name: string) => name in appFunctionsObj
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
            content: 'export default ' + Generator.appMainComponent(this.app)
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
        identifierSet.add('ListItem')
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

    return React.createElement(ListItem, {id: props.path},
${children}
    )
}`

        return [name, code]
    }

    private static pageComponent(app: App, page: Page, errors: ErrorCollector) {
        const stateNames = page.elementArray().map( el => Generator.initialStateEntry(el) ? el.codeName : null ).filter( el => el !== null )
        const stateDefaultEntries = page.elementArray().map( el => Generator.initialStateEntry(el) ).filter( el => !!el )
        const stateDefaultBlock = stateDefaultEntries.length ? `\n        ${stateDefaultEntries.join('\n        ')}\n    `: ''
        const stateDefaultCall = `    const state = Elemento.useObjectStateWithDefaults(props.path, {${stateDefaultBlock}})`

        const identifierSet = new Set<string>()
        const topLevelFunctions = new Set<string>()
        const isPageElement = (name: string) => !!page.elementArray().find( el => el.codeName === name )
        const isPageName = (name: string) => !!app.pages.find( p => p.codeName === name )
        const isKnown = (name: string) => isGlobalFunction(name) || isAppFunction(name) || isPageElement(name) || isPageName(name) || isBuiltIn(name)
        const pageCode = Generator.generateElement(page, identifierSet, topLevelFunctions, isKnown, errors)
        const identifiers = [...identifierSet.values()]

        const componentIdentifiers = identifiers.filter(isComponent)
        const componentDeclarations = componentIdentifiers.length ? `    const {${componentIdentifiers.join(', ')}} = Elemento.components` : ''
        const globalFunctionIdentifiers = identifiers.filter(isGlobalFunction)
        const globalDeclarations = globalFunctionIdentifiers.length ? `    const {${globalFunctionIdentifiers.join(', ')}} = Elemento.globalFunctions` : ''
        const elementoDeclarations = [componentDeclarations, globalDeclarations].filter( d => d !== '').join('\n').trimEnd()

        const appFunctionIdentifiers = identifiers.filter(isAppFunction)
        const appDeclarations = appFunctionIdentifiers.length ? `    const {${appFunctionIdentifiers.join(', ')}} = Elemento.appFunctions(state)` : ''
        const pageNames = identifiers.filter(isPageName)
        const pageNameDeclarations = pageNames.length ? `    const ${pageNames.map( p => `${p} = '${p}'` ).join(', ')}` : ''
        const pageIdentifiers = uniq(identifiers.filter(isPageElement).concat(stateNames as string[]))
        const pageDeclarations = pageIdentifiers.length ? `    const {${pageIdentifiers.join(', ')}} = state` : ''
        const localDeclarations = [appDeclarations, pageNameDeclarations, pageDeclarations].filter( d => d !== '').join('\n').trimEnd()

        const pageFunction = `function ${page.codeName}(props) {
    const pathWith = name => props.path + '.' + name
${elementoDeclarations}
${stateDefaultCall}
${localDeclarations}
    return ${pageCode}
}
`.trimLeft()
        return [...topLevelFunctions, pageFunction].join('\n\n')
    }

    private static appMainComponent(app: App, /*errors: ErrorCollector*/) {
        const identifierSet = new Set<string>()
        const pages = app.pages
        const identifiers = [...identifierSet.values()]
        const globalFunctionIdentifiers = identifiers.filter( id => isGlobalFunction(id))
        const globalDeclarations = globalFunctionIdentifiers.length ? `    const {${globalFunctionIdentifiers.join(', ')}} = Elemento.globalFunctions` : ''
        return `function AppMain(props) {
${globalDeclarations}
    const appPages = {${pages.map( p => p.codeName).join(', ')}}
    const appState = Elemento.useObjectStateWithDefaults('app._data', {currentPage: Object.keys(appPages)[0]})
    const {currentPage} = appState
    return React.createElement('div', {id: '${app.codeName}'},
        React.createElement(appPages[currentPage], {path: \`${app.codeName}.\${currentPage}\`})
    )
}
`.trimLeft()
    }

    private static generateElement(element: Element, identifiers: IdentifierCollector, topLevelFunctions: FunctionCollector, isKnown: (name: string) => boolean, errors: ErrorCollector): string {

        const onError = (propertyName: string) => (err: string) => errors.add(element.id, propertyName, err)

        switch(element.kind) {
        case 'Project':
            throw new Error('Cannot generate code for Project')
        case 'App':
            const app = element as App
            return this.appMainComponent(app)
        case 'Page':
            const page = element as Page
            identifiers.add('Page')
            const children = page.elementArray().map(p => `        ${Generator.generateElement(p, identifiers, topLevelFunctions, isKnown, errors)},`).join('\n')
            return `React.createElement(Page, {id: props.path},
${children}
    )`
        case 'Text': {
            const text = element as Text
            identifiers.add('TextElement')
            const path = `pathWith('${text.codeName}')`
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
            const path = `pathWith('${button.codeName}')`
            const content = Generator.getExprAndIdentifiers(button.content, identifiers, isKnown, onError('content'))
            const action = Generator.getExprAndIdentifiers(button.action, identifiers, isKnown, onError('action'), isAction)
            const reactProperties = definedPropertiesOf({path, content, action})
            return `React.createElement(Button, ${objectLiteral(reactProperties)})`
        }

        case 'List': {
            const list = element as List
            identifiers.add('ListElement')
            const path = `pathWith('${list.codeName}')`
            const items = Generator.getExprAndIdentifiers(list.items, identifiers, isKnown, onError('items')) ?? '[]'
            const reactProperties = definedPropertiesOf({path})
            const [listItemName, listItemCode] = Generator.listItemComponent(list, errors)
            topLevelFunctions.add(listItemCode)
            return `React.createElement(ListElement, ${objectLiteral(reactProperties)}, 
            Elemento.asArray(${items}).map( (item, index) => React.createElement(${listItemName}, {path: pathWith(\`${list.codeName}.\${index}\`), key: item.id ?? index, $item: item})) )`
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
            const reactProperties = definedPropertiesOf({state, display})
            return `React.createElement(Collection, ${objectLiteral(reactProperties)})`
        }

        default:
            throw new UnsupportedValueError(element.kind)
        }
    }

    private static initialStateEntry(element: Element): string {
        function valueAndTypeEntry<T extends TextInput | NumberInput | SelectInput | TrueFalseInput>(element: Element) {
            const input = element as T
            const [valueExpr] = Generator.getExpr(input.initialValue)
            return `${element.codeName}: {${valueExpr ? 'value: ' + valueExpr + ', ' : ''}_type: ${input.kind}.State},`
        }

        switch (element.kind) {
            case 'Project':
                throw new Error('Cannot generate code for Project')
            case 'App':
            case 'Page':
            case 'Text':
            case 'List':
                return ''

            case 'TextInput':
            case 'SelectInput':
            case 'TrueFalseInput':
            case 'NumberInput':
                return valueAndTypeEntry(element)

            case 'Data': {
                const data = element as Data
                const [valueExpr] = Generator.getExpr(data.initialValue)
                return `${element.codeName}: {${valueExpr ? 'value: ' + valueExpr : ''}},`
            }

            case 'Collection': {
                const collection = element as Collection
                const [valueExpr] = Generator.getExpr(collection.initialValue)
                return `${element.codeName}: {${valueExpr ? `value: Collection.initialValue(${valueExpr})` : 'value: Collection.initialValue()'}},`
            }

            case 'Button':
                return ''

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

    private static getExpr(propertyValue: PropertyValue | undefined) {
        const isKnown = () => true
        const identifiers = new Set()
        const errors = []
        const onError = (err: string) => errors.push(err)
        const expr = trimParens(Generator.getExprAndIdentifiers(propertyValue, identifiers, isKnown, onError))
        const isError = !!errors.length

        return [expr, isError]
    }
}