import Element from '../Element'
import {propDef} from '../BaseElement'
import {PropertyDef, PropertyValueType} from '../Types'
import {BuiltInRule, RuleWithDescription} from './Rule'
import BaseTypeElement, {BaseTypeProperties} from './BaseTypeElement'
import {format} from 'date-fns'
import {isExpr} from '../../util/helpers'

type Properties = BaseTypeProperties & {
    readonly min?: PropertyValueType<Date>,
    readonly max?: PropertyValueType<Date>,
}

export default class DateType extends BaseTypeElement<Properties> implements Element {

    readonly kind = 'DateType'
    get iconClass() { return 'calendar_today_outlined' }

    get min() {return this.properties.min}
    get max() {return this.properties.max}

    get rulesFromProperties() {
        const {min, max} = this
        const formatDisplay = (date: PropertyValueType<Date>) => isExpr(date) ? date.expr : format(date, 'dd MMM yyyy')
        return [
            min && new BuiltInRule(`Earliest ${formatDisplay(min)}`),
            max && new BuiltInRule(`Latest ${formatDisplay(max)}`),
        ].filter(el => !!el) as RuleWithDescription[]
    }

    get propertyDefs(): PropertyDef[] {
        return super.propertyDefs.concat([
            propDef('min', 'date'),
            propDef('max', 'date'),
        ])
    }
}
