import React, {ChangeEvent} from 'react'
import {TextField} from '@mui/material'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {useGetObjectState} from '../appData'

type Properties = {path: string, label?: PropVal<string>, }

export default function NumberInput({path, ...props}: Properties) {
    const {label} = valueOfProps(props)

    const optionalProps = definedPropertiesOf({label})
    const numericProps = {type: 'number', sx: { minWidth: 120, flex: 0 }}
    const state = useGetObjectState<NumberInputState>(path)
    const value = state._controlValue ?? ''
    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).value
        const updateValue = controlValue !== '' ? Number(controlValue) : null
        state._setValue(updateValue)
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

export class NumberInputState extends InputComponentState<number>  {
    defaultValue = 0
}

NumberInput.State = NumberInputState
