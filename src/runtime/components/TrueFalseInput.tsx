import React, {ChangeEvent, createElement, FocusEvent} from 'react'
import {Checkbox, FormControl, FormControlLabel, FormHelperText} from '@mui/material'
import {valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {TrueFalseType} from '../types'
import {
    BaseInputComponentProperties,
    getLabelWithRequired,
    inputElementProps,
    propsForInputComponent,
    sxPropsForFormControl
} from './ComponentHelpers'
import {noop} from 'lodash'
import {useObject} from '../appStateHooks'
import {omit} from 'ramda'

type Properties = BaseInputComponentProperties

export default function TrueFalseInput({path, ...props}: Properties) {
    const {label = '', readOnly, show, styles = {}} = valueOfProps(props)
    const sx = sxPropsForFormControl(styles, show)

    const state = useObject<TrueFalseInputState>(path)
    const {dataValue, dataType} = state
    const value = dataValue ?? false
    const labelWithRequired = getLabelWithRequired(dataType, label)
    const inputComponentProps = propsForInputComponent(dataType, styles)
    const inputComponentPropsForCheckbox = omit(['endAdornment'], inputComponentProps.InputProps)
    const inputProps = inputElementProps(styles, false, {})

    const error = state.errorsShown && !state.valid
    const helperText = state.errorsShown && state.errors ? (state.errors as string[]).join('.  ') : undefined

    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).checked
        const updateValue = controlValue !== '' ? controlValue : null
        state._setValue(updateValue)
    }
    const onBlur = (_event: FocusEvent) => state._setBlurred()

    const checkbox = createElement(Checkbox, {
        id: path,
        size: 'small',
        color: 'primary',
        checked: value,
        onChange: readOnly ? noop : onChange,
        disabled: readOnly,
        onBlur,
        ...inputProps,
        ...inputComponentPropsForCheckbox,
    })
    return <FormControl error={error} variant="standard">
        <FormControlLabel label={labelWithRequired}
                          labelPlacement='start'
                          htmlFor={path}
                          control={checkbox}
                          sx={sx}/>
        <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
}

export class TrueFalseInputState extends InputComponentState<boolean, TrueFalseType> {
    defaultValue = false

    get modified() {
        const stateValue = this.state.value
        return stateValue !== undefined
            && (stateValue ?? false) !== (this.originalValue ?? false)
    }
}

TrueFalseInput.State = TrueFalseInputState
