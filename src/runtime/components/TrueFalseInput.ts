import {ChangeEvent, createElement} from 'react'
import {FormControlLabel, Switch} from '@mui/material'
import {valueOfProps} from '../runtimeFunctions'
import {proxyUpdateFnType} from '../stateProxy'
import {InputComponentState} from './InputComponentState'

type Properties = {state: {value?: boolean, _path: string, _controlValue: boolean | null, _update: proxyUpdateFnType}, label?: string}

export default function TrueFalseInput({state, ...props}: Properties) {
    const {_path: path} = state
    const value = state._controlValue ?? false
    const {label = ''} = valueOfProps(props)
    const onChange = (event: ChangeEvent) => state._update({value: (event.target as any).checked})

    return createElement(FormControlLabel, {
        label,
        labelPlacement: 'start',
        control: createElement(Switch, {
            id: path,
            size: 'small',
            color: 'primary',
            checked: value,
            onChange: onChange
        })
    })
}


TrueFalseInput.State = class State extends InputComponentState<boolean> {
    defaultValue = false
}