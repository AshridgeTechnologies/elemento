import React, {ChangeEvent} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {valueOfProps} from '../runtimeFunctions'
import {proxyUpdateFnType} from '../stateProxy'
import {InputComponentState} from './InputComponentState'

type Properties = {state: {value?: number, _path: string, _controlValue: number | null, _update: proxyUpdateFnType}, label?: string}

export default function NumberInput({state, ...props}: Properties) {
    const {label} = valueOfProps(props)

    const optionalProps = definedPropertiesOf({label})
    const numericProps = {type: 'number', sx: { minWidth: 120, flex: 0 }}
    const {_path: path} = state
    const value = state._controlValue ?? ''
    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = controlValue !== '' ? Number(controlValue) : null
        state._update({value: updateValue})
    }

    return React.createElement(TextField, {
        id: path,
        variant: 'outlined',
        size: 'small',
        value,
        onChange,
        ...numericProps,
        ...optionalProps
    })
}

NumberInput.State = class State extends InputComponentState<number> {
    defaultValue = 0
}