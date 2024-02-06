import React from 'react'
import {TextField} from '@mui/material'
import yaml from 'js-yaml'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, valueOf, valueOfProps} from '../runtimeFunctions'
import {useGetObjectState} from '../appData'
import {BaseComponentState, ComponentState} from './ComponentState'
import {isObject, isArray} from 'radash'


type Properties = {path: string, label?: PropVal<string>, width?: PropVal<string | number>, display?: PropVal<boolean>}
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
    const {label, display: displayProp, width} = valueOfProps(props)
    const widthProp = width !== undefined ? {width} : {}
    const sxProps = {sx: {...widthProp}}

    const state = useGetObjectState<CalculationState>(path)
    const {value} = state
    const multiline = true
    const multilineProps = multiline ? {minRows: 1, maxRows: 10} : {}
    const optionalProps = definedPropertiesOf({label, multiline, ...multilineProps})

    const display = displayProp ?? true
    const formControl =  display ? React.createElement(TextField, {
        id: path,
        type: 'text',
        variant: 'outlined',
        size: 'small',
        value: formatDisplay(value),
        InputLabelProps:{ shrink: true },
        ...sxProps,
        ...optionalProps
    }) : null
    return formControl
}

export class CalculationState extends BaseComponentState<StateProperties>
    implements ComponentState<CalculationState> {

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
