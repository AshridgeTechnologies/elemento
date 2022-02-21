import {parse} from 'recast'
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
import {PropertyValue} from '../model/Types'
import Button from '../model/Button'
import NumberInput from '../model/NumberInput'
import SelectInput from '../model/SelectInput'
import TrueFalseInput from '../model/TrueFalseInput'
import {isArray} from 'lodash'

type IdentifierCollector = {add(s: string): void}

function objectLiteral(obj: object) {
    return `{${Object.entries(obj).map(([name, val]) => `${name}: ${val}`).join(', ')}}`
}

const isAction = true
const isGlobalFunction = (name: string) => name in globalFunctions
const isAppFunction = (name: string) => name in appFunctions

const valueLiteral = function (propertyValue: PropertyValue): string {
    if (isArray(propertyValue)) {
        return `[${propertyValue.map(valueLiteral).join(', ')}]`
    } else if (typeof propertyValue === 'string') {
            return propertyValue.includes('\n') ? `\`${propertyValue}\`` : `'${propertyValue}'`
    } else {
        return propertyValue.toString()
    }
}

export default class Generator {
    constructor(public app: App) {
    }

    outputFiles() {
        const pageFiles = this.app.pages.map( page => ({
            name: `${(page.codeName)}.js`,
            content: Generator.pageContent(this.app, page)
        }))
        const appMainFile = {
            name: 'appMain.js',
            content: Generator.appMainContent(this.app)
        }
        return [...pageFiles, appMainFile]
    }

    private static pageContent(app: App, page: Page) {
        const stateDefaultEntries = page.elementArray().map( el => Generator.initialStateEntry(el) ).filter( el => !!el )
        const stateDefaultBlock = stateDefaultEntries.length ? `\n        ${stateDefaultEntries.join('\n        ')}\n    `: ''
        const stateDefaultCall = `    const state = useObjectStateWithDefaults(props.path, {${stateDefaultBlock}})`

        const identifierSet = new Set<string>()
        const isPageElement = (name: string) => !!page.elementArray().find( el => el.codeName === name )
        const isPageName = (name: string) => !!app.pages.find( p => p.codeName === name )
        const isKnown = (name: string) => isGlobalFunction(name) || isAppFunction(name) || isPageElement(name) || isPageName(name)
        const pageCode = Generator.generateElement(page, identifierSet, isKnown)
        const identifiers = [...identifierSet.values()]

        const globalFunctionIdentifiers = identifiers.filter(isGlobalFunction)
        const globalDeclarations = globalFunctionIdentifiers.length ? `    const {${globalFunctionIdentifiers.join(', ')}} = window.globalFunctions` : ''
        const appFunctionIdentifiers = identifiers.filter(isAppFunction)
        const appDeclarations = appFunctionIdentifiers.length ? `    const {${appFunctionIdentifiers.join(', ')}} = window.appFunctions` : ''
        const pageNames = identifiers.filter(isPageName)
        const pageNameDeclarations = pageNames.length ? `    const ${pageNames.map( p => `${p} = '${p}'` ).join(', ')}` : ''
        const pageIdentifiers = identifiers.filter(isPageElement)
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

    private static appMainContent(app: App) {
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

    private static generateElement(element: Element, identifiers: IdentifierCollector, isKnown: (name: string) => boolean): string {

        switch(element.kind) {
            case "App":
                const app = element as App
                return this.appMainContent(app)
            case "Page":
                const page = element as Page
                const children = page.elementArray().map(p => `        ${Generator.generateElement(p, identifiers, isKnown)},`).join('\n');
                return `React.createElement('div', {id: props.path},
${children}
    )`
            case "Text": {
                const text = element as Text
                const path = `pathWith('${text.codeName}')`
                const content = Generator.getExprAndIdentifiers(text.content, identifiers, isKnown)
                const fontSize = Generator.getExprAndIdentifiers(text.fontSize, identifiers, isKnown)
                const fontFamily = Generator.getExprAndIdentifiers(text.fontFamily, identifiers, isKnown)
                const color = Generator.getExprAndIdentifiers(text.color, identifiers, isKnown)
                const backgroundColor = Generator.getExprAndIdentifiers(text.backgroundColor, identifiers, isKnown)
                const border = Generator.getExprAndIdentifiers(text.border, identifiers, isKnown)
                const borderColor = Generator.getExprAndIdentifiers(text.borderColor, identifiers, isKnown)
                const width = Generator.getExprAndIdentifiers(text.width, identifiers, isKnown)
                const height = Generator.getExprAndIdentifiers(text.height, identifiers, isKnown)
                const reactProperties = definedPropertiesOf({path, fontSize, fontFamily, color, backgroundColor, border, borderColor, width, height})
                return `React.createElement(TextElement, ${objectLiteral(reactProperties)}, ${content})`
            }

            case "TextInput":
                const textInput = element as TextInput
                const path = `pathWith('${textInput.codeName}')`
                const initialValue = Generator.getExprAndIdentifiers(textInput.initialValue, identifiers, isKnown)
                const maxLength = Generator.getExprAndIdentifiers(textInput.maxLength, identifiers, isKnown)
                const multiline = Generator.getExprAndIdentifiers(textInput.multiline, identifiers, isKnown)
                const label = Generator.getExprAndIdentifiers(textInput.label, identifiers, isKnown)
                const reactProperties = definedPropertiesOf({path, initialValue, maxLength, multiline, label})
                return `React.createElement(TextInput, ${objectLiteral(reactProperties)})`

            case "NumberInput": {
                const numberInput = element as NumberInput
                const path = `pathWith('${numberInput.codeName}')`
                const initialValue = Generator.getExprAndIdentifiers(numberInput.initialValue, identifiers, isKnown)
                const label = Generator.getExprAndIdentifiers(numberInput.label, identifiers, isKnown)
                const reactProperties = definedPropertiesOf({path, initialValue, label})
                return `React.createElement(NumberInput, ${objectLiteral(reactProperties)})`
            }

            case "SelectInput": {
                const selectInput = element as SelectInput
                const path = `pathWith('${selectInput.codeName}')`
                const values = Generator.getExprAndIdentifiers(selectInput.values, identifiers, isKnown)
                const initialValue = Generator.getExprAndIdentifiers(selectInput.initialValue, identifiers, isKnown)
                const label = Generator.getExprAndIdentifiers(selectInput.label, identifiers, isKnown)
                const reactProperties = definedPropertiesOf({path, values, initialValue, label})
                return `React.createElement(SelectInput, ${objectLiteral(reactProperties)})`
            }

            case "TrueFalseInput": {
                const trueFalseInput = element as TrueFalseInput
                const path = `pathWith('${trueFalseInput.codeName}')`
                const initialValue = Generator.getExprAndIdentifiers(trueFalseInput.initialValue, identifiers, isKnown)
                const label = Generator.getExprAndIdentifiers(trueFalseInput.label, identifiers, isKnown)
                const reactProperties = definedPropertiesOf({path, initialValue, label})
                return `React.createElement(TrueFalseInput, ${objectLiteral(reactProperties)})`
            }

            case "Button": {
                const button = element as Button
                const path = `pathWith('${button.codeName}')`
                const content = Generator.getExprAndIdentifiers(button.content, identifiers, isKnown)
                const action = Generator.getExprAndIdentifiers(button.action, identifiers, isKnown, isAction)
                const reactProperties = definedPropertiesOf({path, content, action})
                return `React.createElement(Button, ${objectLiteral(reactProperties)})`
            }

            default:
                throw new UnsupportedValueError(element.kind)

        }
    }

    private static initialStateEntry(element: Element): string {
        switch(element.kind) {
            case "App":
                return ''
            case "Page":
                return ''
            case "Text":
                return ''

            case "TextInput":
                const textInput = element as TextInput
                return `${textInput.codeName}: {value: ${Generator.getExpr(textInput.initialValue) || '""'}},`

            case "NumberInput":
                const numberInput = element as NumberInput
                return `${numberInput.codeName}: {value: ${Generator.getExpr(numberInput.initialValue) || 0}},`

            case "SelectInput":
                const selectInput = element as SelectInput
                return `${selectInput.codeName}: {value: ${Generator.getExpr(selectInput.initialValue) || undefined}},`

            case "TrueFalseInput":
                const trueFalseInput = element as TrueFalseInput
                return `${trueFalseInput.codeName}: {value: ${Generator.getExpr(trueFalseInput.initialValue) || false}},`

            case 'Button':
                return ''

            default:
                throw new UnsupportedValueError(element.kind)

        }

    }

    private static getExprAndIdentifiers(propertyValue: PropertyValue | undefined, identifiers: IdentifierCollector, isKnown: (name: string) => boolean, isAction: boolean = false) {
        if (propertyValue === undefined) {
            return undefined
        }

        if (isExpr(propertyValue)) {
            const {expr} = propertyValue
            try {
                const ast = parse(expr)
                const thisIdentifiers = new Set<string>()
                visit(ast, {
                    visitIdentifier(path) {
                        const node = path.value
                        const parentNode = path.parentPath.value
                        const isPropertyIdentifier = parentNode.type === "MemberExpression" && parentNode.property === node
                        if (!isPropertyIdentifier) {
                            thisIdentifiers.add(node.name)
                        }
                        this.traverse(path);
                    }
                })

                const identifierNames = Array.from(thisIdentifiers.values())
                const unknownIdentifiers = identifierNames.filter(id => !isKnown(id))
                if (unknownIdentifiers.length) {
                    return `React.createElement('span', {title: "Unknown names: ${unknownIdentifiers.join(', ')}"}, '#ERROR')`
                }

                identifierNames.forEach(name => identifiers.add(name))

                return isAction ? `() => {${expr}}` : expr
            } catch(e: any) {
                return `React.createElement('span', {title: "${e.constructor.name}: ${e.message}"}, '#ERROR')`
            }
        } else {
            return valueLiteral(propertyValue)
        }
    }

    private static getExpr(propertyValue: PropertyValue | undefined) {
        if (propertyValue === undefined) {
            return undefined
        }

        if (isExpr(propertyValue)) {
            return propertyValue.expr
        } else {
            return valueLiteral(propertyValue)
        }
    }
}