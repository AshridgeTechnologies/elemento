import {createElement as el} from 'react'
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from '@mui/material'
import {valueOfProps} from '../runtimeFunctions'
import {proxyUpdateFnType} from '../stateProxy'

type Properties = { label?: string, values?: string[], state: { value?: string, _path: string, _update: proxyUpdateFnType } }

export default function SelectInput({state, ...props}: Properties) {
    const {value = '', _path: path} = state
    const {values = [], label} = valueOfProps(props)
    const onChange = (event: SelectChangeEvent) => {
        state._update({value: (event.target as any).value || null})
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
