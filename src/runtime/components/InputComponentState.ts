import {BaseComponentState, ComponentState} from './ComponentState'
import {PropVal, valueOf} from '../runtimeFunctions'
import BaseType from '../types/BaseType'
import {ElementMetadata} from '../../model/ModelElement'

export type InputComponentExternalProps<T, DT extends BaseType<T, any>, Props> = {initialValue?: PropVal<T | null> | null, dataType?: DT} & Props
export type InputComponentStateProps<T> = {value?: T | null, errorsShown?: boolean, editedValue?: string}

export const InputComponentMetadata: ElementMetadata = {
    stateProps: []
}

export default abstract class InputComponentState<T, DT extends BaseType<T, any>, Props = {}>
    extends BaseComponentState<InputComponentExternalProps<T, DT, Props>, InputComponentStateProps<T>>
    implements ComponentState {

    abstract defaultValue: T | null

    get value() {
        return this.dataValue ?? this.defaultValue
    }

    get originalValue() {
        return valueOf(this.props.initialValue) as T
    }

    get valid() {
        return this.errors === null
    }

    get errors() {
        return this.dataType?.validate(this.propsOrStateValue ?? null) ?? null
    }

    get modified() {
        const stateValue = this.state.value
        return stateValue !== undefined
            && (stateValue ?? null) !== (this.originalValue ?? null)
    }

    get errorsShown() {
        return this.state.errorsShown ?? false
    }

    get dataValue(): T | null {
        return this.propsOrStateValue ?? null
    }

    get controlValue() {
        return this.state.editedValue
    }

    get dataType() { return this.props.dataType }

    protected get propsOrStateValue() {
        return this.state.value !== undefined ? this.state.value : this.originalValue
    }

    _setValue(value: T | null) {
        this.updateState({value})
    }

    _setBlurred() {
        this.updateState({errorsShown: true, editedValue: undefined})
    }

    valueOf() {
        return this.value
    }

    [Symbol.toPrimitive]() {
        return this.valueOf()
    }

    toString() { return String(this.value) }

    Reset() {
        this.updateState({value: undefined, errorsShown: false})
    }

    ShowErrors(errorsShown: boolean) {
        this.updateState({errorsShown})
    }
}
