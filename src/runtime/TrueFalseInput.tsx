import React, {ChangeEvent} from 'react'
import {FormControlLabel, Switch} from '@mui/material'
import {updateState} from './appData'
import {valueOfProps} from './runtimeFunctions'

type Properties = {state: {value?: boolean, _path: string, }, label?: string}

export default function TrueFalseInput({state, ...props}: Properties) {
    const {value, _path: path} = state
    const {label = ''} = valueOfProps(props)
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
