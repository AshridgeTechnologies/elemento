import BaseType, {BaseProperties, type ValidationErrors} from './BaseType'
import Rule from './Rule'
import BaseStructuredType from './BaseStructuredType'
import {isArray} from 'lodash'

type Properties = BaseProperties
export default class ListType extends BaseStructuredType<any[], Properties> {

    constructor(name: string, properties: Properties = {}, rules: Rule[] = [], public itemType: BaseType<any, any> ) {
        super('List', name, properties, rules)
    }

    itemErrorsUnfiltered(item: any): [string, ValidationErrors][] {
        return item.map( (it: any, index: number) => [index.toString(), this.itemType.validate(it)])
    }

    override isCorrectDataType(item: any): boolean {
        return isArray(item)
    }
}