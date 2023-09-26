import React, {createElement as el, FocusEvent} from 'react'
import {FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent} from '@mui/material'
import {valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {useGetObjectState} from '../appData'
import {ChoiceType} from '../../shared/types'
import {InputWithInfo} from './InputWithInfo'

type Properties = {path: string,  label?: string, values?: string[]}

export default function SelectInput({path, ...props}: Properties) {
    const {values: valuesFromProps = [], label} = valueOfProps(props)
    const state = useGetObjectState<SelectInputState>(path)
    const {value} = state
    const dataType = state.dataType
    const required = dataType?.required

    const error = state.errorsShown && !state.valid
    const helperText = state.errorsShown && state.errors ? (state.errors as string[]).join('.  ') : undefined

    const onChange = (event: SelectChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = controlValue !== '' ? controlValue : null
        state._setValue(updateValue)
    }
    const onBlur = (_event: FocusEvent) => state.ShowErrors(true)

    const labelId = path + '_label'
    const noSelectionItem = el(MenuItem, {value: ''}, el('em', null, 'None'))
    const values = (valuesFromProps?.length ? valuesFromProps : dataType?.values) ?? []
    const menuItems = [noSelectionItem, ...values.map((v: any) => el(MenuItem, {key: v, value: v}, v))]

    const formControl = el(FormControl, {variant: 'filled', size: 'small', sx: {minWidth: 120}, error},
        el(InputLabel, {id: labelId}, label),
        el(Select, {
            labelId,
            id: path,
            value,
            // @ts-ignore
            onChange,
            onBlur,
        }, ...menuItems),
        el(FormHelperText, {}, helperText)
    )
    return InputWithInfo({description: dataType?.description, required, formControl})
}

export class SelectInputState extends InputComponentState<string, ChoiceType> {
    defaultValue = ''
}

SelectInput.State = SelectInputState