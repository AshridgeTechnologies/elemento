import React, {ChangeEvent, createElement, FocusEvent} from 'react'
import {Checkbox, FormControl, FormControlLabel, FormHelperText} from '@mui/material'
import {valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {useGetObjectState} from '../appData'
import {TrueFalseType} from '../../shared/types'
import {InputWithInfo} from './InputWithInfo'

type Properties = {path: string, label?: string}

export default function TrueFalseInput({path, ...props}: Properties) {
    const state = useGetObjectState<TrueFalseInputState>(path)
    const value = state._controlValue ?? false
    const dataType = state.dataType
    const {label: plainLabel = ''} = valueOfProps(props)
    const label = dataType?.required ? plainLabel + ' (required)' : plainLabel

    const error = state.errorsShown && !state.valid
    const helperText = state.errorsShown && state.errors ? (state.errors as string[]).join('.  ') : undefined

    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).checked
        const updateValue = controlValue !== '' ? controlValue : null
        state._setValue(updateValue)
    }
    const onBlur = (_event: FocusEvent) => state.ShowErrors(true)

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
    return InputWithInfo({description: dataType?.description, formControl})
}

export class TrueFalseInputState extends InputComponentState<boolean, TrueFalseType> {
    defaultValue = false
}

TrueFalseInput.State = TrueFalseInputState