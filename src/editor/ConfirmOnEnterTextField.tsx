import {OutlinedInput, OutlinedInputProps, TextField, TextFieldProps} from '@mui/material'
import React, {useState} from 'react'

export default function ConfirmOnEnterTextField(props: OutlinedInputProps & {onFinishChange: (val: string) => void}) {
    const {onFinishChange, value, ...inputProps} = props
    const [changedValue, setChangedValue] = useState<string | undefined>(undefined)
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => setChangedValue(event.target.value)
    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            confirmChange()
        }
        if (event.key === 'Escape') {
            abandonChange()
        }
    }
    const confirmChange = () => {
        if (changedValue !== undefined && changedValue !== value) {
            onFinishChange?.(changedValue ?? '')
        }
        setChangedValue(undefined)
    }

    const abandonChange = () => {
        setChangedValue(undefined)
    }

    return <OutlinedInput {...inputProps}
                            color={changedValue ? 'warning' : undefined}
                          value={changedValue ?? value as string}
                          onChange={onChange}
                          onBlur={abandonChange}
                          onKeyDown={onKeyDown}
    />
}
