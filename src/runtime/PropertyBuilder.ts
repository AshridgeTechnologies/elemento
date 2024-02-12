import {isEmpty} from 'ramda'
import {mapValues} from 'radash'

export default class PropertyBuilder {
    readonly properties: {[p: string]: any}
    readonly errors: {[p: string]: Error} = {}

    constructor(propertyInputs: object) {
        const evalProp = (propVal: any, propName: string) => {
            try {
                return typeof propVal === 'function' ? propVal() : propVal
            } catch (e: any) {
                this.errors[propName] = e
                return null
            }
        }
        this.properties = mapValues(propertyInputs, evalProp)
    }

    get hasErrors() { return !isEmpty(this.errors)}
}
