import App from '../model/App.js'
import Element from '../model/Element.js'
import Page from '../model/Page.js'
import Text from '../model/Text.js'

export default class Generator {
    constructor(public app: App) {
    }

    outputFiles() {
        const page = this.app.pages[0];
        return [
            {
                name: 'appMain.js',
                content: this.appMainContent(page)
            }
        ]
    }

    private appMainContent(page: Page) {
        const pageCode = Generator.generateElement(page)
        return `function AppMain(props) {
    return React.createElement('div', null,
    ${pageCode}
    )
}
`

    }

    private static generateElement(element: Element): string {
        if(Page.is(element)) {
            const children = element.elements.map(p => `        ${Generator.generateElement(p)},`).join('\n');
            return `React.createElement('div', null,
${children}
    )`
        }
        if(Text.is(element)) return `React.createElement(TextElement, null, ${element.contentExpr})`
        /* c8 ignore next */
        return `React.createElement(div, null, '???')`
    }
}