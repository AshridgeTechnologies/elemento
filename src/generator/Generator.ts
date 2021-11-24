import {parse} from 'recast'
import {visit,} from "ast-types"

import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'
import Element from '../model/Element'
import TextInput from '../model/TextInput'
import {globalFunctions} from '../runtime/globalFunctions'

type IdentifierCollector = {add(s: string): void}

export default class Generator {
    constructor(public app: App) {
    }

    outputFiles() {
        return [
            {
                name: 'appMain.js',
                content: Generator.appMainContent(this.app)
            }
        ]
    }

    private static appMainContent(app: App) {
        const identifiers = new Set<string>()
        const pageCode = Generator.generateElement(app.pages[0], identifiers)
        const globalDeclarations = identifiers.size ? `    const {${[...identifiers.values()].join(', ')}} = window.globalFunctions` : ''
        return `function AppMain(props) {
${globalDeclarations}
    return React.createElement('div', null,
    ${pageCode}
    )
}
`.trimLeft()
    }

    private static generateElement(element: Element, identifiers: IdentifierCollector): string {
        switch(element.kind) {
            case "App":
                const app = element as App
                return this.appMainContent(app)
            case "Page":
                const page = element as Page
                const children = page.elementArray().map(p => `        ${Generator.generateElement(p, identifiers)},`).join('\n');
                return `React.createElement('div', null,
${children}
    )`
            case "Text":
                const text = element as Text
                const content = Generator.getExprAndIdentifiers(text.contentExpr, identifiers)
                return `React.createElement(TextElement, null, ${content})`
            case "TextInput":
                const textInput = element as TextInput
                return `React.createElement('div', null)`
            default:
                const _exhaustiveCheck: never = element.kind
                return _exhaustiveCheck

        }
    }

    private static getExprAndIdentifiers(expr: string, identifiers: IdentifierCollector) {
        function isKnown(identifier: string) {
            return identifier in globalFunctions
        }

        try {
            const ast = parse(expr)
            const thisIdentifiers = new Set<string>()
            visit(ast, {
                visitIdentifier(path) {
                    const node = path.value
                    thisIdentifiers.add(node.name)
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