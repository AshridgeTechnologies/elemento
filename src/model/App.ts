import Page from './Page.js';

export default class App  {
    constructor(
        public id: string,
        public name: string,
        public pages: Page[]
    ) {}

}