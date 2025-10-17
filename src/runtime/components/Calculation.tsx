import React from 'react'
import {SxProps, TextField} from '@mui/material'
import yaml from 'js-yaml'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, StylesPropVals, valueOf, valueOfProps} from '../runtimeFunctions'
import {BaseComponentState} from '../state/BaseComponentState'
import {isArray, isObject} from 'radash'
import {pick} from 'ramda'
import {formControlStyles, inputElementProps, propsForInputComponent, sxFieldSetProps, sxProps} from './ComponentHelpers'
import {use$state} from '../state/appStateHooks'
import {Definitions} from '../../model/schema'
import {ElementSchema} from '../../model/ModelElement'


type Properties = Readonly<{path: string, initialValue: any, whenTrueAction: () => void, label?: PropVal<string>, show?: PropVal<boolean>, styles?: StylesPropVals}>
type ExternalStateProperties = Partial<Readonly<{initialValue: any, whenTrueAction: () => void}>>
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

export const CalculationSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Calculation",
    "description": "Description of Calculation",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "Calculation",
    "icon": "calculate_outlined",
    "elementType": "statefulUI",
    "parentType": "any",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "calculation": {
                    "description": "The ",
                    "$ref": "#/definitions/Expression"
                },
                "label": {
                    "description": "The ",
                    "$ref": "#/definitions/StringOrExpression"
                },
                "whenTrueAction": {
                    "description": "The ",
                    "$ref": "#/definitions/ActionExpression",
                    "argNames": []
                },
                "show": {
                    "description": "The ",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "styles": {
                    "description": "The ",
                    "$ref": "#/definitions/Styles"
                }
            }
        }
    },
    "required": [
        "kind",
        "properties"
    ],
    "unevaluatedProperties": false,
    "definitions": Definitions
}

export const CalculationMetadata = {
    stateProps: ['calculation', 'whenTrueAction']
}

export default function Calculation({path, ...props}: Properties) {
    const {label, show = false, styles = {}} = valueOfProps(props)
    const sx = {...sxProps(pick(formControlStyles, styles), show), fieldset: sxFieldSetProps(styles)} as SxProps<{}>

    const {initialValue, whenTrueAction} = props
    const state = use$state(path, CalculationState, {initialValue, whenTrueAction})
    const {value} = state
    setTimeout( () => state.latest().checkTriggered(), 0)
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
        sx,
        ...inputProps,
        ...inputComponentProps,
        ...optionalProps
    }) : null
}

export class CalculationState extends BaseComponentState<ExternalStateProperties, InternalStateProperties> {

    // 'calculation' is called value in the state object to be consistent with input elements
    // AND so it will work with Form
    get value() {
        return valueOf(this.props.initialValue)
    }

    private get previousValueTruthy(): boolean {
        return this.state.previousValueTruthy
    }

    private get whenTrueAction() {
        return this.props.whenTrueAction
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
Calculation.Schema = CalculationSchema
Calculation.Metadata = CalculationMetadata
