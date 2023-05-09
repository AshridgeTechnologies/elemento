import BaseType, {BaseProperties, type ValidationErrors} from './BaseType'
import Rule from './Rule'
import {isEmpty} from 'ramda'

type Properties = BaseProperties
export default abstract class BaseStructuredType<T extends object | any[], PropertiesType extends BaseProperties> extends BaseType<T, Properties> {

    constructor(kind: 'List' | 'Record', name: string, properties: Properties = {}, rules: Rule[] = [] ) {
        super(kind, name, properties, rules)
    }

    override validate(item: T | null): ValidationErrors {
        const selfErrors = () => {
            const errors = super.validate(item) as string[] | null
            return errors ? {_self: errors} : {}
        }
        const itemErrors = () => {
            if (!item) return {}
            const itemErrorEntries = this.itemErrorsUnfiltered(item).filter(([, err]) => err !== null)
            return Object.fromEntries(itemErrorEntries)
        }
        const allErrors = {...selfErrors(), ...itemErrors() }
        return isEmpty(allErrors) ? null : allErrors as {}
    }

    abstract itemErrorsUnfiltered(item: any): [string, ValidationErrors][]
}