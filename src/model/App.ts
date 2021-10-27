import Page from './Page.js';
import Element from './Element.js'

export default class App implements Element {
    constructor(
        public id: string,
        public name: string,
        public pages: Page[]
    ) {}

}