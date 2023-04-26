import Rule from './Rule'
import BaseType, {BaseProperties} from './BaseType'

type Properties = BaseProperties

export default class TrueFalseType extends BaseType<boolean, Properties>{
    constructor(name: string, properties: Properties = {}, rules: Rule[] = []) {
        super('TrueFalse', name, properties, rules)
    }
}