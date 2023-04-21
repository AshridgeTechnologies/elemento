import Element from '../Element'
import {propDef} from '../BaseElement'
import {PropertyDef} from '../Types'
import Rule from './Rule'
import BaseTypeElement, {BaseTypeProperties} from './BaseTypeElement'
import {format} from 'date-fns'

type Properties = BaseTypeProperties & {
    readonly min?: Date,
    readonly max?: Date,
}

export default class NumberType extends BaseTypeElement<Properties> implements Element {

    static kind = 'DateType'
    static get iconClass() { return 'calendar_today_outlined' }

    get min() {return this.properties.min}
    get max() {return this.properties.max}

    get shorthandRules() {
        const {min, max} = this
        const formatDisplay = (date: Date) => format(date, 'dd MMM yyyy')
        const dateExpr = (date: Date) => `new Date('${format(date, 'yyyy-MM-dd')}')`
        return [
            min && new Rule('_', '_min', {description: `Earliest ${formatDisplay(min)}`, formula: `min(${dateExpr(min)})`}),
            max && new Rule('_', '_max', {description: `Latest ${formatDisplay(max)}`, formula: `max(${dateExpr(max)})`}),
        ].filter(el => !!el) as Rule[]
    }

    get propertyDefs(): PropertyDef[] {
        return super.propertyDefs.concat([
            propDef('min', 'date'),
            propDef('max', 'date'),
        ])
    }
}
