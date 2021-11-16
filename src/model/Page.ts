import Element, {ElementType} from './Element'
import BaseElement,{equalArrays} from './BaseElement'
import Text from './Text'

export default class Page extends BaseElement implements Element {

    constructor(
        id: string,
        name: string,
        private readonly props: {style?: string},
        public readonly elements: ReadonlyArray<Element>
    ) {
        super(id, name)
    }

    kind: ElementType = 'Page'

    static is(element: Element): element is Page {
        return element.constructor.name === this.name
    }

    protected getElements(): ReadonlyArray<Element> { return this.elements }

    get properties() {return this.props}
    get style() { return this.props.style }

    set(id: string, propertyName: string, value: any): Page {
        if (id === this.id) {
            if (propertyName === 'name') {
                return new Page(this.id, value, this.props, this.elements)
            }
            if (propertyName === 'elements') {
                return new Page(this.id, this.name, this.props, value)
            }

            const updatedProps = {...this.props, [propertyName]:value}
            return new Page(this.id, this.name, updatedProps, this.elements)
        }

        const newElements = this.getElements().map( el => el.set(id, propertyName, value))
        if (!equalArrays(newElements, this.getElements())) {
            return new Page(this.id, this.name, this.props, newElements)
        }

        return this
    }

    static fromJSON({id, name, props, elements}: { id: string; name: string; props: any, elements: any[] }): Page {
        return new Page(id, name, props, elements.map(el => Text.fromJSON(el)))
    }
}