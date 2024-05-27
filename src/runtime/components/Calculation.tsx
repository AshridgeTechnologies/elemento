import React from 'react'
import {SxProps, TextField} from '@mui/material'
import yaml from 'js-yaml'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, StylesPropVals, valueOf, valueOfProps} from '../runtimeFunctions'
import {useGetObjectState} from '../appData'
import {BaseComponentState, ComponentState} from './ComponentState'
import {isArray, isObject} from 'radash'
import {equals, pick} from 'ramda'
import {formControlStyles, inputElementProps, propsForInputComponent, sxFieldSetProps, sxProps} from './ComponentHelpers'


type Properties = Readonly<{path: string, label?: PropVal<string>, show?: PropVal<boolean>, styles?: StylesPropVals}>
type ExternalStateProperties = Partial<Readonly<{value: any, whenTrueAction: () => void}>>
type InternalStateProperties = Partial<Readonly<{previousValueTruthy: any}>>

const isObjOrArray = (value: any) => isObject(value) ?? isArray(value)
const formatDisplay = (value: any) => {
    if (typeof value === 'string') return value

    const hasNestedObject = isObjOrArray(value) && Object.values(value).some( isObjOrArray )
    const options = {
        skipInvalid: true,
        flowLevel: hasNestedObject ? 1 : 0
    }

    return yaml.dump(value, options)
}

export default function Calculation({path, ...props}: Properties) {
    const {label, show, styles = {}} = valueOfProps(props)
    const sx = {...sxProps(pick(formControlStyles, styles), show), fieldset: sxFieldSetProps(styles)} as SxProps<{}>

    const state = useGetObjectState<CalculationState>(path)
    const {value} = state
    state.checkTriggered()
    const multiline = true
    const multilineProps = multiline ? {minRows: 1, maxRows: 10} : {}
    const optionalProps = definedPropertiesOf({label, multiline, ...multilineProps})
    const inputComponentProps = propsForInputComponent(undefined, styles)
    const inputProps = inputElementProps(styles, false, {})

    return React.createElement(TextField, {
        id: path,
        type: 'text',
        variant: 'outlined',
        size: 'small',
        value: formatDisplay(value),
        InputLabelProps: {shrink: true},
        sx,
        ...inputProps,
        ...inputComponentProps,
        ...optionalProps
    })
}

export class CalculationState extends BaseComponentState<ExternalStateProperties, InternalStateProperties>
    implements ComponentState<CalculationState> {

    // 'calculation' is called value in the state object to be consistent with input elements
    // AND so it will work with Form
    get value() {
        return valueOf(this.props.value)
    }

    private get previousValueTruthy(): boolean {
        return this.state.previousValueTruthy
    }

    private get whenTrueAction() {
        return this.props.whenTrueAction
    }

    protected isEqualTo(newObj: this): boolean {
        return equals(this.props.value, newObj.props.value) && this.props.whenTrueAction === newObj.props.whenTrueAction
    }

    checkTriggered() {
        if (!this.whenTrueAction) return
        const currentValueTruthy = !!this.value
        const triggered = currentValueTruthy && !this.previousValueTruthy
        if (triggered) {
            this.whenTrueAction()
        }
        if (this.previousValueTruthy !== currentValueTruthy) {
            this.updateState({previousValueTruthy: currentValueTruthy})
        }
    }

    valueOf() {
        return this.value
    }

    toString() {
        return this.value.toString()
    }
}

Calculation.State = CalculationState
