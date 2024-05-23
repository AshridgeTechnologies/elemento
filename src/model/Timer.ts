import {ComponentType, eventAction, PropertyDef, PropertyExpr, PropertyValueType, Show, Styling} from './Types'
import Element from './Element'
import BaseElement, {propDef, visualPropertyDefs} from './BaseElement'

type Properties = Partial<Readonly<{
    period: PropertyValueType<number>,
    interval: PropertyValueType<number>,
    intervalAction: PropertyExpr,
    endAction: PropertyExpr,
    label: PropertyValueType<string>,
    show: PropertyValueType<boolean>,
}>> & Show & Styling

export default class Timer extends BaseElement<Properties> implements Element {

    readonly kind = 'Timer'
    get iconClass() { return 'av_timer' }
    type(): ComponentType { return 'statefulUI' }

    get period() {return this.properties.period}
    get interval() {return this.properties.interval}
    get intervalAction() {return this.properties.intervalAction}
    get endAction() {return this.properties.endAction}
    get label() {return this.properties.label}
    get show() {return this.properties.show ?? true}
    get styles() {return this.properties.styles}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('period', 'number', {state: true}),
            propDef('interval', 'number', {state: true}),
            propDef('intervalAction', eventAction('$timer'), {state: true}),
            propDef('endAction', eventAction('$timer'), {state: true}),
            propDef('label', 'string'),
            ...visualPropertyDefs()
        ]
    }

    get stateProperties(): string[] {
        return super.stateProperties.concat([
            'isRunning', 'isFinished', 'value', 'startTime', 'intervalTime', 'elapsedTime', 'remainingTime', 'intervalCount', 'finishedTime'
        ])
    }

}
