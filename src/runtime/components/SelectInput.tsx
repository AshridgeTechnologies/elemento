import React from 'react'
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from '@mui/material'
import {updateState} from '../appData'
import {valueOfProps} from '../runtimeFunctions'

type Properties = { label?: string, values?: string[], state: {value?: string, _path: string, } }

export default function SelectInput({state, ...props}: Properties) {
    const {value = '', _path: path} = state
    const {values = [], label} = valueOfProps(props)
    const onChange = (event: SelectChangeEvent) => updateState(path, {value: (event.target as any).value || null})

    return <FormControl variant="filled" size='small' sx={{minWidth: 120}}>
        <InputLabel id={path + '_label'}>{label}</InputLabel>
        <Select
            labelId={path + '_label'}
            id={path}
            value={value}
            onChange={onChange}
        >
            <MenuItem>&nbsp;</MenuItem>
            {values.map( (v: any) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
        </Select>
    </FormControl>
}
