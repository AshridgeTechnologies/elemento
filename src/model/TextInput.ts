import BaseElement from './BaseElement'
import Element, {ElementType} from './Element'

export default class TextInput extends BaseElement implements Element {

    constructor(
        id: string,
        name: string,
        private readonly props: {
            readonly initialValue?: string,
            readonly maxLength?: number,
        }) {
        super(id, name)
    }

    static is(element: Element): element is TextInput {
        return element.constructor.name === this.name
    }

    kind: ElementType = 'TextInput'


    get properties() {return this.props}
    get initialValue() { return this.props.initialValue }
    get maxLength() { return this.props.maxLength }

    set(id: string, propertyName: keyof TextInput, value: any): TextInput {
        if (id !== this.id) {
            return this
        }

        if (propertyName === 'name') {
            return new TextInput(this.id, value, this.props)
        }

        const updatedProps = {...this.props, [propertyName]:value}
        return new TextInput(this.id, this.name, updatedProps)
    }

    static fromJSON({id, name, props}: {id: string, name: string, props: any}): TextInput {
        return new TextInput(id, name, props)
    }

}