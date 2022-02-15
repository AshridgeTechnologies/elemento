import React, {ChangeEvent} from 'react'
import {FormControlLabel, Switch} from '@mui/material'
import {updateState, useObjectState} from './appData'

type Properties = {path: string, label?: string, initialValue?: boolean}

export default function TrueFalseInput({path, initialValue = false, label = ''}: Properties) {
    const state = useObjectState(path)
    const value: boolean = (state?.value !== undefined) ? state.value : initialValue
    const onChange = (event: ChangeEvent) => updateState(path, {value: (event.target as any).checked })

    return <FormControlLabel
        label={label}
        labelPlacement="start"
        control={<Switch
            id={path}
            size='small'
            color="primary"
            checked={value}
            onChange={onChange}
        />}
        />
}
