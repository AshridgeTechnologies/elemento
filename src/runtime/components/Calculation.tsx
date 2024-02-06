import React from 'react'
import {TextField} from '@mui/material'
import yaml from 'js-yaml'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, StylesProps, valueOf, valueOfProps} from '../runtimeFunctions'
import {useGetObjectState} from '../appData'
import {BaseComponentState, ComponentState} from './ComponentState'
import {isArray, isObject} from 'radash'
import {pick} from 'ramda'
import {formControlStyles, inputElementProps, propsForInputComponent, sxFieldSetProps} from './InputComponentHelpers'


type Properties = {path: string, label?: PropVal<string>, show?: PropVal<boolean>, styles?: StylesProps}
type StateProperties = {value: any}

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
    const {label, show = true, styles = {}} = valueOfProps(props)
    const sxProps = {sx: {...pick(formControlStyles, styles), fieldset: sxFieldSetProps(styles)}}

    const state = useGetObjectState<CalculationState>(path)
    const {value} = state
    const multiline = true
    const multilineProps = multiline ? {minRows: 1, maxRows: 10} : {}
    const optionalProps = definedPropertiesOf({label, multiline, ...multilineProps})
    const inputComponentProps = propsForInputComponent(undefined, styles)
    const inputProps = inputElementProps(styles, false, {})

    return show ? React.createElement(TextField, {
        id: path,
        type: 'text',
        variant: 'outlined',
        size: 'small',
        value: formatDisplay(value),
        InputLabelProps: {shrink: true},
        ...inputProps,
        ...inputComponentProps,
        ...sxProps,
        ...optionalProps
    }) : null
}

export class CalculationState extends BaseComponentState<StateProperties>
    implements ComponentState<CalculationState> {

    // 'calculation' is called value in the state object to be consistent with input elements
    // AND so it will work with Form
    get value() {
        return valueOf(this.props.value)
    }

    valueOf() {
        return this.value
    }

    toString() {
        return this.value.toString()
    }
}

Calculation.State = CalculationState
