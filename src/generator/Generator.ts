import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'
import Element from '../model/Element'
import TextInput from '../model/TextInput'

export default class Generator {
    constructor(public app: App) {
    }

    outputFiles() {
        return [
            {
                name: 'appMain.js',
                content: Generator.generateElement(this.app)
            }
        ]
    }

    private static appMainContent(app: App) {
        const pageCode = Generator.generateElement(app.pages[0])
        return `function AppMain(props) {
    return React.createElement('div', null,
    ${pageCode}
    )
}
`
    }

    private static generateElement(element: Element): string {
        switch(element.kind) {
            case "App":
                const app = element as App
                return this.appMainContent(app)
            case "Page":
                const page = element as Page
                const children = page.elementArray().map(p => `        ${Generator.generateElement(p)},`).join('\n');
                return `React.createElement('div', null,
${children}
    )`
            case "Text":
                const text = element as Text
                return `React.createElement(TextElement, null, ${text.contentExpr})`
            case "TextInput":
                const textInput = element as TextInput
                return `React.createElement('div', null)`
            default:
                const _exhaustiveCheck: never = element.kind
                return _exhaustiveCheck

        }
    }
}