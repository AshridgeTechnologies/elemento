import React from 'react'
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from '@mui/material'
import {updateState, useObjectState} from './appData'

type Properties = { path: string, label?: string, values?: string[], initialValue?: string }

export default function SelectInput({path, values = [], initialValue = '', label}: Properties) {
    const state = useObjectState(path)
    const value = (state?.value !== undefined) ? state.value : initialValue
    const onChange = (event: SelectChangeEvent) => updateState(path, {value: (event.target as any).value})

    return <FormControl variant="filled" size='small' sx={{minWidth: 120}}>
        <InputLabel id={path + '_label'}>{label}</InputLabel>
        <Select
            labelId={path + '_label'}
            id={path}
            value={value}
            onChange={onChange}
        >
            <MenuItem>&nbsp;</MenuItem>
            {values.map( v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
        </Select>
    </FormControl>
}
