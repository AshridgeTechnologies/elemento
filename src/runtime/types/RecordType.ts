import BaseType, {BaseProperties, ValidationErrors} from './BaseType'
import Rule from './Rule'
import BaseStructuredType from './BaseStructuredType'
import {noSpaces} from '../../util/helpers'
import {isPlainObject} from 'lodash'

type Properties = BaseProperties
type FieldsType = BaseType<any, any>[]

export default class RecordType<T extends object = object> extends BaseStructuredType<T, Properties> {
    private _fields: FieldsType

    constructor(name: string, properties: Properties = {}, rules: Rule[] = [], fields: FieldsType = [] ) {
        super('Record', name, properties, rules)
        this._fields = fields
    }

    get fields() {
        const basedOnTypeFields: FieldsType = (this.basedOn instanceof RecordType) ? this.basedOn.fields : []
        return [...basedOnTypeFields, ...this._fields]
    }

    itemErrorsUnfiltered(item: any): [string, ValidationErrors][] {
        return this.fields.map( type => {
            const fieldName = type.codeName
            return [fieldName, type.validate(item[fieldName as keyof object])]
        })
    }

    override isCorrectDataType(item: any): boolean {
        return isPlainObject(item)
    }
}
