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
        const children = page.elements.map(p => `        ${Generator.generateElement(p)},`).join('\n');
        return `function AppMain(props) {
    return React.createElement('div', null,
${children}
    )
}
`

    }

    private static generateElement(element: Element): string {
        if(Text.is(element)) return `React.createElement(TextElement, null, ${element.contentExpr})`
        return `'???'`
    }
}