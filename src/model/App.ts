import Page from './Page';
import Element, {ElementType} from './Element'
import {equalArrays} from './BaseElement'

export default class App implements Element  {
    constructor(
        public readonly id: string,
        public readonly name: string,
        private readonly props: {author?: string},
        public readonly pages: ReadonlyArray<Page>
    ) {}

    findElement(id: string): Element | null {
        if (id === this.id) {
            return this
        }
        for (const p of this.pages) {
            const element = p.findElement(id)
            if (element) return element
        }
        return this.pages.find( page => page.id === id) || null
    }

    kind: ElementType = 'App'

    protected getElements() { return this.pages }

    get properties() {return this.props}

    set(id: string, propertyName: string, value: any): App {
        if (id === this.id) {
            if (propertyName === 'name') {
                return new App(this.id, value, this.props, this.getElements())
            }
            if (propertyName === 'pages') {
                return new App(this.id, this.name, this.props, value)
            }

            const updatedProps = {...this.props, [propertyName]:value}
            return new App(this.id, this.name, updatedProps, this.pages)
        }

        const newElements = this.getElements().map( el => el.set(id, propertyName, value))
        if (!equalArrays(newElements, this.getElements())) {
            return new App(this.id, this.name, this.props, newElements)
        }

        return this
    }

    static fromJSON({id, name, props, pages}: { id: string; name: string; props: any, pages: any[] }): App {
        return new App(id, name, props, pages.map( p => Page.fromJSON(p)))
    }
}