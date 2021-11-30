import {parse} from 'recast'
import {visit,} from "ast-types"

import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'
import Element from '../model/Element'
import TextInput from '../model/TextInput'
import {globalFunctions} from '../runtime/globalFunctions'
import UnsupportedValueError from '../util/UnsupportedValueError'
import {definedPropertiesOf} from '../util/helpers'

type IdentifierCollector = {add(s: string): void}

function objectLiteral(obj: object) {
    return `{${Object.entries(obj).map(([name, val]) => `${name}: ${val}`).join(', ')}}`
}

const isGlobalFunction = (name: string) => name in globalFunctions

export default class Generator {
    constructor(public app: App) {
    }

    outputFiles() {
        const page = this.app.pages[0]
        return [
            {
                name: `${(page.codeName)}.js`,
                content: Generator.pageContent(page)
            },
            {
                name: 'appMain.js',
                content: Generator.appMainContent(this.app)
            }
        ]
    }

    private static pageContent(page: Page) {
        const stateDefaultEntries = page.elementArray().map( el => Generator.initialStateEntry(el) ).filter( el => !!el )
        const stateDefaultBlock = stateDefaultEntries.length ? `\n        ${stateDefaultEntries.join('\n        ')}\n    `: ''
        const stateDefaultCall = `    const state = useObjectStateWithDefaults(props.path, {${stateDefaultBlock}})`

        const identifierSet = new Set<string>()
        const isPageElement = (name: string) => !!page.elementArray().find( el => el.codeName === name )
        const isKnown = (name: string) => isGlobalFunction(name) || isPageElement(name)
        const pageCode = Generator.generateElement(page, identifierSet, isKnown)
        const identifiers = [...identifierSet.values()]

        const globalFunctionIdentifiers = identifiers.filter(isGlobalFunction)
        const globalDeclarations = globalFunctionIdentifiers.length ? `    const {${globalFunctionIdentifiers.join(', ')}} = window.globalFunctions` : ''
        const pageIdentifiers = identifiers.filter(isPageElement)
        const pageDeclarations = pageIdentifiers.length ? `    const {${pageIdentifiers.join(', ')}} = state` : ''
        const declarations = [globalDeclarations, pageDeclarations].join('\n').trimEnd()


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
        const page = app.pages[0]
        const identifiers = [...identifierSet.values()]
        const globalFunctionIdentifiers = identifiers.filter( id => isGlobalFunction(id))
        const globalDeclarations = globalFunctionIdentifiers.length ? `    const {${globalFunctionIdentifiers.join(', ')}} = window.globalFunctions` : ''
        return `function AppMain(props) {
${globalDeclarations}
    return React.createElement('div', {id: 'app'},
        React.createElement(${page.codeName}, {path: 'app.${page.codeName}'})
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
            case "Text":
                const text = element as Text
                const content = Generator.getExprAndIdentifiers(text.contentExpr, identifiers, isKnown)
                return `React.createElement(TextElement, {path: pathWith('${text.codeName}')}, ${content})`

            case "TextInput":
                const textInput = element as TextInput
                const path = `pathWith('${textInput.codeName}')`
                const initialValue = Generator.getExprAndIdentifiers(textInput.initialValue, identifiers, isKnown)
                const maxLength = Generator.getExprAndIdentifiers(textInput.maxLength, identifiers, isKnown)
                const label = Generator.getExprAndIdentifiers(textInput.label, identifiers, isKnown)
                const reactProperties = definedPropertiesOf({path, initialValue, maxLength, label})
                return `React.createElement(TextInput, ${objectLiteral(reactProperties)})`

            default:
                throw new UnsupportedValueError(element.kind)

        }
    }

    private static initialStateEntry(element: Element): string {
        switch(element.kind) {
            case "App":
                const app = element as App
                return ''
            case "Page":
                const page = element as Page
                return ''
            case "Text":
                const text = element as Text
                return ''

            case "TextInput":
                const textInput = element as TextInput
                return `${textInput.codeName}: {value: ${textInput.initialValue || '""'}},`

            default:
                throw new UnsupportedValueError(element.kind)

        }

    }

    private static getExprAndIdentifiers(expr: string | undefined, identifiers: IdentifierCollector, isKnown: (name: string) => boolean) {
        if (expr === undefined) {
            return undefined
        }

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

            return expr
        } catch(e: any) {
            return `React.createElement('span', {title: "${e.constructor.name}: ${e.message}"}, '#ERROR')`
        }
    }
}