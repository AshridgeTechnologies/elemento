import BaseType, {BaseProperties, ValidationErrors} from './BaseType'
import Rule from './Rule'
import BaseStructuredType from './BaseStructuredType'
import {noSpaces} from '../../util/helpers'
import {isPlainObject} from 'lodash'

type Properties = BaseProperties

export default class RecordType extends BaseStructuredType<object, Properties> {

    constructor(name: string, properties: Properties = {}, rules: Rule[] = [], public fields: BaseType<any, any>[] ) {
        super('Record', name, properties, rules)
    }

    itemErrorsUnfiltered(item: any): [string, ValidationErrors][] {
        return this.fields.map( type => {
            const fieldName = noSpaces(type.name)
            return [fieldName, type.validate(item[fieldName as keyof object])]
        })
    }

    override isCorrectDataType(item: any): boolean {
        return isPlainObject(item)
    }
}