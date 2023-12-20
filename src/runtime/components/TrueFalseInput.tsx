import React, {ChangeEvent, createElement, FocusEvent} from 'react'
import {Checkbox, FormControl, FormControlLabel, FormHelperText} from '@mui/material'
import {valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {useGetObjectState} from '../appData'
import {TrueFalseType} from '../types'
import {InputWithInfo} from './InputWithInfo'

type Properties = {path: string, label?: string}

export default function TrueFalseInput({path, ...props}: Properties) {
    const state = useGetObjectState<TrueFalseInputState>(path)
    const value = state .dataValue ?? false
    const dataType = state.dataType
    const {label = ''} = valueOfProps(props)
    const required = dataType?.required

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
        onChange: onChange,
        onBlur
    })
    const formControl = <FormControl error variant="standard">
        <FormControlLabel label={label}
                          labelPlacement='start'
                          htmlFor={path}
                          control={checkbox}/>
        <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
    return InputWithInfo({description: dataType?.description, required, formControl})
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