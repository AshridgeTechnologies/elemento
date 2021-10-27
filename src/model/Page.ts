import Element from './Element.js'

export default class Page implements Element {
    constructor(
        public id: string,
        public name: string,
        public elements: Element[]
    ) {}
}