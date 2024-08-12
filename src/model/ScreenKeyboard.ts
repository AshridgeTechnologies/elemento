import Element from './Element'
import {ComponentType, eventAction, PropertyDef, PropertyExpr, PropertyValueType, Show, Styling} from './Types'
import BaseElement, {propDef, visualPropertyDefs} from './BaseElement'

export type Properties = Partial<Readonly<{
    keyAction: PropertyExpr,
    useRealKeyboard: PropertyValueType<boolean>,
}>> & Styling & Show

export default class ScreenKeyboard extends BaseElement<Properties> implements Element {

    readonly kind = 'ScreenKeyboard'
    get iconClass() { return 'keyboard' }
    type(): ComponentType { return 'statefulUI' }

    get keyAction() { return this.properties.keyAction }
    get useRealKeyboard() { return this.properties.useRealKeyboard }
    get show() { return this.properties.show }
    get styles() { return this.properties.styles }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('keyAction', eventAction('$key')),
            propDef('useRealKeyboard', 'boolean'),
            ...visualPropertyDefs()
        ]
    }
}
