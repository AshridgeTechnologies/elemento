import React, {useState} from 'react'
import {ElementId, PropertyExpr, PropertyType, PropertyValue} from '../model/Types'
import {isArray, startCase} from 'lodash'
import {Button, FormControl, InputLabel, MenuItem, Select, TextField} from '@mui/material'
import {isExpr} from '../util/helpers'
import {OnChangeFn} from './Types'
import UnsupportedValueError from '../util/UnsupportedValueError'

export default function PropertyInput({ elementId, name, type, value, onChange, error}: { elementId: ElementId, name: string, type: PropertyType, value: PropertyValue | undefined,
    onChange: OnChangeFn, error?: string }) {
    const valueIsExpr = value !== undefined && isExpr(value) || type === 'action'
    const [expr, setExpr] = useState(valueIsExpr)

    const typedValue = (input: string): PropertyValue => {
        switch (type) {
            case 'number':
                return Number(input)
            case 'string':
                return input
            case 'string list':
                return input.trim().split(/ *, */)
            case 'string multiline':
                return input
            case 'boolean':
                return input === 'true'
            default:
                throw new UnsupportedValueError(type as never)
        }
    }
    const valueToSend = (inputString: string | undefined, isExpr: boolean) => {
        if (inputString === undefined || inputString === '') {
            return undefined
        }
        return isExpr ? {expr: inputString} : typedValue(inputString)
    }
    const updatedPropertyValue = (inputString: string) => {
        return valueToSend(inputString, expr)
    }

    const initialInputValue = () => {
        if (value === undefined) {
            return ''
        } else if (isExpr(value)) {
            return value.expr
        } else if (isArray(value)) {
            return value.join(', ')
        } else {
            return value
        }
    }

    const toggleKind = () => {
        setExpr(!expr)

        const currentInputString = valueIsExpr ? (value as PropertyExpr).expr : value?.toString()
        const newValueIsExpr = !valueIsExpr
        const newValue = type=== 'boolean' && !newValueIsExpr ? undefined : valueToSend(currentInputString, newValueIsExpr)
        onChange(elementId, name, newValue)
    }

    const numericProps = (type === 'number' && !expr) ? {type: 'number', inputProps: {min: 0}, sx: { minWidth: 120, flex: 0 }} : {}
    const label = startCase(name)
    const fixedButtonColor = 'primary'
    const exprButtonColor = 'secondary'
    const exprButtonLabel = 'fx='
    const fixedButtonLabel = type === 'number' ? '123' : type === 'boolean' ? 'y/n' : 'abc'
    const buttonLabel = expr ? exprButtonLabel : fixedButtonLabel
    const buttonColor = expr ? exprButtonColor : fixedButtonColor
    const buttonMessage = expr ? 'Expression.  Click to change to fixed value' : 'Fixed value.  Click to change to expression'
    const errorProps = error ? {error: true, helperText: error} : {}

    const button = type === 'action'
        ? <Button variant='outlined' disableElevation size='small' sx={{padding: '4px 2px', minWidth: '3rem', maxHeight: '2.6rem'}}
                  color={exprButtonColor} disabled title={'Action expression required'}>{exprButtonLabel}</Button>
        : <Button variant='outlined' disableElevation size='small' sx={{padding: '4px 2px', minWidth: '3rem', maxHeight: '2.6rem'}}
                  color={buttonColor} onClick={toggleKind} title={buttonMessage}>{buttonLabel}</Button>

    return <div style={{display: 'inline-flex'}} className='property-input'>
        {button}
        {type === 'boolean' && !expr ?
            <FormControl variant="filled" size='small' sx={{ minWidth: 120 }}>
                <InputLabel id={name + '_label'}>{label}</InputLabel>
                <Select
                    labelId={name + '_label'}
                    id={name}
                    value={initialInputValue().toString()}
                    onChange={(event) => onChange(elementId, name, updatedPropertyValue(event.target.value))}
                >
                    <MenuItem><em>default</em></MenuItem>
                    <MenuItem value={'true'}>Yes</MenuItem>
                    <MenuItem value={'false'}>No</MenuItem>
                </Select>
            </FormControl>
            :
            <TextField id={name} label={label} variant='filled' size='small' sx={{flex: 1}}
                       value={initialInputValue()}
                       multiline={type === 'string multiline' || expr}
                       {...numericProps}
                       {...errorProps}
                       onChange={(event) => onChange(elementId, name, updatedPropertyValue(event.target.value))}/>
        }
    </div>
}