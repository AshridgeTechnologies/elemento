import {ChangeEvent, createElement} from 'react'
import {FormControlLabel, Switch} from '@mui/material'
import {valueOfProps} from '../runtimeFunctions'
import InputComponentState from './InputComponentState'
import {useGetObjectState} from '../appData'

type Properties = {path: string, label?: string}

export default function TrueFalseInput({path, ...props}: Properties) {
    const state = useGetObjectState<TrueFalseInputState>(path)
    const value = state._controlValue ?? false
    const {label = ''} = valueOfProps(props)
    const onChange = (event: ChangeEvent) => {
        const controlValue = (event.target as any).checked
        const updateValue = controlValue !== '' ? controlValue : null
        state._setValue(updateValue)
    }

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

export class TrueFalseInputState extends InputComponentState<boolean> {
    defaultValue = false
}

TrueFalseInput.State = TrueFalseInputState