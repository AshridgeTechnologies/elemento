import React, {ChangeEvent} from 'react'
import {FormControlLabel, Switch} from '@mui/material'
import {updateState} from './appData'

type Properties = {state: {value?: boolean, _path: string, }, label?: string}

export default function TrueFalseInput({state, label = ''}: Properties) {
    const {value, _path: path} = state
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
