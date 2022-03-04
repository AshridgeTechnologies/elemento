import {parse, print} from 'recast'
import {visit,} from "ast-types"

import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'
import Element from '../model/Element'
import TextInput from '../model/TextInput'
import {globalFunctions} from '../runtime/globalFunctions'
import appFunctions from '../runtime/appFunctions'
import UnsupportedValueError from '../util/UnsupportedValueError'
import {definedPropertiesOf, isExpr} from '../util/helpers'
import {ElementId, PropertyValue} from '../model/Types'
import Button from '../model/Button'
import NumberInput from '../model/NumberInput'
import SelectInput from '../model/SelectInput'
import TrueFalseInput from '../model/TrueFalseInput'
import {isArray, isPlainObject} from 'lodash'
import {uniq} from 'ramda'
import Data from '../model/Data'

type IdentifierCollector = {add(s: string): void}
interface ErrorCollector {
    add(elementId: ElementId, propertyName: string, error: string): void
}

function safeKey(name: string) { return name.match(/\W/) ? `'${name}'` : name}
function objectLiteral(obj: object) {
    return `{${Object.entries(obj).map(([name, val]) => `${safeKey(name)}: ${val}`).join(', ')}}`
}

const isAction = true
const isGlobalFunction = (name: string) => name in globalFunctions
const isAppFunction = (name: string) => name in appFunctions
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
            content: Generator.pageContent(this.app, page, errorCollector)
        }))
        const appMainFile = {
            name: 'appMain.js',
            content: Generator.appMainContent(this.app)
        }
        return {files: [...pageFiles, appMainFile], errors: errorCollector.errors}
    }

    private static pageContent(app: App, page: Page, errors: ErrorCollector) {
        const stateNames = page.elementArray().map( el => Generator.initialStateEntry(el) ? el.codeName : null ).filter( el => el !== null )
        const stateDefaultEntries = page.elementArray().map( el => Generator.initialStateEntry(el) ).filter( el => !!el )
        const stateDefaultBlock = stateDefaultEntries.length ? `\n        ${stateDefaultEntries.join('\n        ')}\n    `: ''
        const stateDefaultCall = `    const state = useObjectStateWithDefaults(props.path, {${stateDefaultBlock}})`

        const identifierSet = new Set<string>()
        const isPageElement = (name: string) => !!page.elementArray().find( el => el.codeName === name )
        const isPageName = (name: string) => !!app.pages.find( p => p.codeName === name )
        const isBuiltIn = (name: string) => ['undefined', 'null'].includes(name)
        const isKnown = (name: string) => isGlobalFunction(name) || isAppFunction(name) || isPageElement(name) || isPageName(name) || isBuiltIn(name)
        const pageCode = Generator.generateElement(page, identifierSet, isKnown, errors)
        const identifiers = [...identifierSet.values()]

        const globalFunctionIdentifiers = identifiers.filter(isGlobalFunction)
        const globalDeclarations = globalFunctionIdentifiers.length ? `    const {${globalFunctionIdentifiers.join(', ')}} = window.globalFunctions` : ''
        const appFunctionIdentifiers = identifiers.filter(isAppFunction)
        const appDeclarations = appFunctionIdentifiers.length ? `    const {${appFunctionIdentifiers.join(', ')}} = window.appFunctions` : ''
        const pageNames = identifiers.filter(isPageName)
        const pageNameDeclarations = pageNames.length ? `    const ${pageNames.map( p => `${p} = '${p}'` ).join(', ')}` : ''
        const pageIdentifiers = uniq(identifiers.filter(isPageElement).concat(stateNames as string[]))
        const pageDeclarations = pageIdentifiers.length ? `    const {${pageIdentifiers.join(', ')}} = state` : ''
        const declarations = [globalDeclarations, appDeclarations, pageNameDeclarations, pageDeclarations].filter( d => d !== '').join('\n').trimEnd()

        return `function ${page.codeName}(props) {
    const pathWith = name => props.path + '.' + name
${stateDefaultCall}
${declarations}
    return ${pageCode}
}
`.trimLeft()
    }

    private static appMainContent(app: App, /*errors: ErrorCollector*/) {
        const identifierSet = new Set<string>()
        const pages = app.pages
        const identifiers = [...identifierSet.values()]
        const globalFunctionIdentifiers = identifiers.filter( id => isGlobalFunction(id))
        const globalDeclarations = globalFunctionIdentifiers.length ? `    const {${globalFunctionIdentifiers.join(', ')}} = window.globalFunctions` : ''
        return `function AppMain(props) {
${globalDeclarations}
    const appPages = {${pages.map( p => p.codeName).join(', ')}}
    const appState = useObjectStateWithDefaults('app._data', {currentPage: Object.keys(appPages)[0]})
    const {currentPage} = appState
    return React.createElement('div', {id: 'app'},
        React.createElement(appPages[currentPage], {path: \`app.\${currentPage}\`})
    )
}
`.trimLeft()
    }

    private static generateElement(element: Element, identifiers: IdentifierCollector, isKnown: (name: string) => boolean, errors: ErrorCollector): string {

        const onError = (propertyName: string) => (err: string) => errors.add(element.id, propertyName, err)

        switch(element.kind) {
            case "App":
                const app = element as App
                return this.appMainContent(app)
            case "Page":
                const page = element as Page
                const children = page.elementArray().map(p => `        ${Generator.generateElement(p, identifiers, isKnown, errors)},`).join('\n');
                return `React.createElement(Page, {id: props.path},
${children}
    )`
            case "Text": {
                const text = element as Text
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

            case "TextInput":
                const textInput = element as TextInput
                const initialValue = Generator.getExprAndIdentifiers(textInput.initialValue, identifiers, isKnown, onError('initialValue'))
                const state = textInput.codeName
                const maxLength = Generator.getExprAndIdentifiers(textInput.maxLength, identifiers, isKnown, onError('maxLength'))
                const width = Generator.getExprAndIdentifiers(textInput.width, identifiers, isKnown, onError('width'))
                const multiline = Generator.getExprAndIdentifiers(textInput.multiline, identifiers, isKnown, onError('multiline'))
                const label = Generator.getExprAndIdentifiers(textInput.label, identifiers, isKnown, onError('label'))
                const reactProperties = definedPropertiesOf({state, maxLength, multiline, label, width})
                return `React.createElement(TextInput, ${objectLiteral(reactProperties)})`

            case "NumberInput": {
                const numberInput = element as NumberInput
                const initialValue = Generator.getExprAndIdentifiers(numberInput.initialValue, identifiers, isKnown, onError('initialValue'))
                const state = numberInput.codeName
                const label = Generator.getExprAndIdentifiers(numberInput.label, identifiers, isKnown, onError('label'))
                const reactProperties = definedPropertiesOf({state, label})
                return `React.createElement(NumberInput, ${objectLiteral(reactProperties)})`
            }

            case "SelectInput": {
                const selectInput = element as SelectInput
                const values = Generator.getExprAndIdentifiers(selectInput.values, identifiers, isKnown, onError('values'))
                const initialValue = Generator.getExprAndIdentifiers(selectInput.initialValue, identifiers, isKnown, onError('initialValue'))
                const state = selectInput.codeName
                const label = Generator.getExprAndIdentifiers(selectInput.label, identifiers, isKnown, onError('label'))
                const reactProperties = definedPropertiesOf({state, values, label})
                return `React.createElement(SelectInput, ${objectLiteral(reactProperties)})`
            }

            case "TrueFalseInput": {
                const trueFalseInput = element as TrueFalseInput
                const initialValue = Generator.getExprAndIdentifiers(trueFalseInput.initialValue, identifiers, isKnown, onError('initialValue'))
                const state = trueFalseInput.codeName
                const label = Generator.getExprAndIdentifiers(trueFalseInput.label, identifiers, isKnown, onError('label'))
                const reactProperties = definedPropertiesOf({state, label})
                return `React.createElement(TrueFalseInput, ${objectLiteral(reactProperties)})`
            }

            case "Button": {
                const button = element as Button
                const path = `pathWith('${button.codeName}')`
                const content = Generator.getExprAndIdentifiers(button.content, identifiers, isKnown, onError('content'))
                const action = Generator.getExprAndIdentifiers(button.action, identifiers, isKnown, onError('action'), isAction)
                const reactProperties = definedPropertiesOf({path, content, action})
                return `React.createElement(Button, ${objectLiteral(reactProperties)})`
            }

            case "Data": {
                const data = element as Data
                const initialValue = Generator.getExprAndIdentifiers(data.initialValue, identifiers, isKnown, onError('initialValue'))
                const state = data.codeName
                const display = Generator.getExprAndIdentifiers(data.display, identifiers, isKnown, onError('display'))
                const reactProperties = definedPropertiesOf({state, display})
                return `React.createElement(Data, ${objectLiteral(reactProperties)})`
            }

            default:
                throw new UnsupportedValueError(element.kind)
        }
    }

    private static initialStateEntry(element: Element): string {
        function valueEntry<T extends TextInput | NumberInput | SelectInput | TrueFalseInput>(element: Element) {
            const input = element as T
            const [valueExpr, isError] = Generator.getExpr(input.initialValue)
            return `${element.codeName}: {${valueExpr ? 'value: ' + valueExpr + ', ' : ''}defaultValue: ${valueLiteral((input.constructor as any).defaultValue ?? '')}},`
        }

        switch(element.kind) {
            case "App":
                return ''
            case "Page":
                return ''
            case "Text":
                return ''

            case "TextInput":
            case "NumberInput":
            case "SelectInput":
            case "TrueFalseInput":
                return valueEntry(element)

            case "Data":{
                const data = element as Data
                const [valueExpr, isError] = Generator.getExpr(data.initialValue)
                return `${element.codeName}: {${valueExpr ? 'value: ' + valueExpr : ''}},`
            }

            case 'Button':
                return ''

            default:
                throw new UnsupportedValueError(element.kind)
        }
    }

    private static getExprAndIdentifiers(propertyValue: PropertyValue | undefined, identifiers: IdentifierCollector,
                                         isKnown: (name: string) => boolean,
                                         onError: (err: string) => void, isAction: boolean = false) {
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
                        const isPropertyIdentifier = parentNode.type === "MemberExpression" && parentNode.property === node
                        const isPropertyKey = parentNode.type === "Property" && parentNode.key === node
                        if (!isPropertyIdentifier && !isPropertyKey) {
                            thisIdentifiers.add(node.name)
                        }
                        this.traverse(path);
                    },
                    visitAssignmentExpression(path) {
                        const node = path.value
                        node.type = "BinaryExpression"
                        node.operator = '=='
                        this.traverse(path);
                    },

                    visitProperty(path) {
                        const node = path.value
                        if (isShorthandProperty(node)) {
                            node.value.name = 'undefined'
                            const errorMessage = `Incomplete item: ${node.key.name}`
                            onError(errorMessage)
                        }
                        this.traverse(path);
                    }
                })

                const identifierNames = Array.from(thisIdentifiers.values())
                const unknownIdentifiers = identifierNames.filter(id => !isKnown(id))
                if (unknownIdentifiers.length) {
                    const errorMessage = `Unknown names: ${unknownIdentifiers.join(', ')}`
                    onError(errorMessage)
                    return `codeGenerationError(\`${expr}\`, '${errorMessage}')`
                }

                identifierNames.forEach(name => identifiers.add(name))

                const exprCode = print(ast).code
                return isAction ? `() => {${exprCode}}` : exprCode
            } catch(e: any) {
                const errorMessage = `${e.constructor.name}: ${e.message}`
                onError(errorMessage)
                return `codeGenerationError(\`${expr}\`, '${errorMessage}')`
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