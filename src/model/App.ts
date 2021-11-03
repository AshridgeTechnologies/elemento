import Page from './Page';

export default class App  {
    constructor(
        public id: string,
        public name: string,
        public pages: Page[]
    ) {}

}