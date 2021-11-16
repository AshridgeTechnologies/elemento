import Element, {ElementType} from './Element'
import BaseElement from './BaseElement'

export default class Text extends BaseElement implements Element {
    constructor(
        id: string,
        name: string,
        private readonly props: {
            readonly contentExpr: string,
            readonly style?: string,
        }) {
        super(id, name)
    }

    static is(element: Element): element is Text {
        return element.constructor.name === this.name
    }

    kind: ElementType = 'Text'

    get properties() {return this.props}
    get contentExpr() {return this.props.contentExpr}

    set(id: string, propertyName: keyof Text, value: any): Text {
        if (id !== this.id) {
            return this
        }

        if (propertyName === 'name') {
            return new Text(this.id, value, this.props)
        }

        const updatedProps = {...this.props, [propertyName]:value}
        return new Text(this.id, this.name, updatedProps)
    }

    static fromJSON({id, name, props}: {id: string, name: string, props: any}): Text {
        return new Text(id, name, props)
    }
}
