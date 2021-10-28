import Element, {ElementType} from './Element.js'

export default class Text implements Element {
    constructor(
        public id: string,
        public name: string,
        public contentExpr: string) {}

    static is(element: Element): element is Text {
        return element.constructor.name === this.name
    }

    kind: ElementType = 'Text'

}
