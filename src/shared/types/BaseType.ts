import {isNil} from 'ramda'
import Rule from './Rule'

export type Kind = 'Text' | 'Number' | 'Date' | 'Choice' | 'TrueFalse' | 'Record' | 'List'

export type ValidationErrors = string[] | { [name: string]: string[] } | null
export type BaseProperties = Partial<Readonly<{
    description: string,
    required: boolean,
}>>

export default abstract class BaseType<T, PropertiesType extends BaseProperties> {
    constructor(public readonly kind: Kind, public readonly name: string, protected readonly properties: PropertiesType, private readonly rules: Rule[] = []) {}

    get description() { return this.properties.description }
    get required() { return this.properties.required ?? false}

    private get requiredRule() {
        const isRequiredRule = new Rule('Required', (item: any) => !isNil(item) && this.isCorrectDataType(item), {description: 'Required'})
        const isOptionalRule = new Rule('Optional', (_: any) => true, {description: 'Optional'})
        return this.required ? isRequiredRule : isOptionalRule
    }

    protected get shorthandRules(): Rule[] {return []
    }

    private get nonNullRules(): Rule[] {
        return [...this.shorthandRules, ...this.rules]
    }

    private get allRules(): Rule[] {
        return [this.requiredRule, ...this.nonNullRules]
    }
    get ruleDescriptions() {
        return this.allRules.map(r => r.description)
    }

    validate(item: T | null): ValidationErrors {
        const requiredError = this.requiredRule.check(item)
        if (requiredError) return [requiredError]
        if (isNil(item) || !this.isCorrectDataType(item)) return null
        const errors = this.nonNullRules.map( r => r.check(item)).filter( err => err !== null ) as string[]
        return errors.length ? errors : null
    }

    /**
     * Can the item be considered as a possible value for this data type, before checking other constraints
     * @param item
     */
    abstract isCorrectDataType(item: any): boolean
}