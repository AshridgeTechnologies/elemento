export default class Rule {
    constructor(public name: string, public validationFunction: (item: any) => boolean, private properties: { description: string }) {
    }

    get description() { return this.properties.description }

    check(item: any) {
        return this.validationFunction(item) ? null : this.description
    }
}