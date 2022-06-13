import {createElement as el} from 'react'
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from '@mui/material'
import {valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {useGetObjectState} from '../appData'

type Properties = {path: string,  label?: string, values?: string[]}

export default function SelectInput({path, ...props}: Properties) {
    const {values = [], label} = valueOfProps(props)
    const state = useGetObjectState<SelectInputState>(path)
    const value = state._controlValue ?? ''
    const onChange = (event: SelectChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = controlValue !== '' ? controlValue : null
        state._setValue(updateValue)
    }

    const labelId = path + '_label'
    const noSelectionItem = el(MenuItem, {value: ''}, el('em', null, 'None'))
    const menuItems = [noSelectionItem, ...values.map((v: any) => el(MenuItem, {key: v, value: v}, v))]

    return el(FormControl, {variant: 'filled', size: 'small', sx: {minWidth: 120}},
        el(InputLabel, {id: labelId}, label),
        el(Select, {
            labelId,
            id: path,
            value,
            // @ts-ignore
            onChange: onChange
        }, ...menuItems)
    )
}

export class SelectInputState extends InputComponentState<string> {
    defaultValue = ''
}

SelectInput.State = SelectInputState