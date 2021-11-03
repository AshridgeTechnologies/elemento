import Element, {ElementType} from './Element'

export default class Page implements Element {
    constructor(
        public id: string,
        public name: string,
        public elements: Element[]
    ) {
    }

    kind: ElementType = 'Page'

    static is(element: Element): element is Page {
        return element.constructor.name === this.name
    }

}