import React, {ChangeEvent} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../util/helpers'
import {updateState, useObjectState} from './appData'

type Properties = {path: string, label?: string, initialValue?: number}

export default function NumberInput({path, initialValue = 0, label}: Properties) {
    const state = useObjectState(path)
    const optionalProps = definedPropertiesOf({label})
    const value = (state?.value !== undefined) ? state.value : initialValue
    const onChange = (event: ChangeEvent) => updateState(path, {value: Number((event.target as any).value) })

    return React.createElement(TextField, {
        id: path,
        type: 'text',
        variant: 'outlined',
        size: 'small',
        value,
        onChange,
        ...optionalProps
    })
}
