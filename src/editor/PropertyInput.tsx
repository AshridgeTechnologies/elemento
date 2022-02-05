import React, {useState} from 'react'
import {ElementId, PropertyExpr, PropertyType, PropertyValue} from '../model/Types'
import {startCase} from 'lodash'
import {Button, FormControl, InputLabel, MenuItem, Select, TextField} from '@mui/material'
import {isExpr} from '../util/helpers'
import {OnChangeFn} from './Types'

export default function PropertyInput({ elementId, name, type, value, onChange}: { elementId: ElementId, name: string, type: PropertyType, value: PropertyValue | undefined, onChange: OnChangeFn }) {
    const valueIsExpr = value !== undefined ? isExpr(value) : false
    const [expr, setExpr] = useState(valueIsExpr)
    const buttonLabel = expr ? 'fx=' : 'abc'

    const typedValue = (input: string): PropertyValue => {
        switch (type) {
            case 'number':
                return Number(input)
            case 'string':
                return input
            case 'boolean':
                return input === 'true'
        }
    }
    const valueToSend = (inputString: string | undefined, isExpr: boolean) => {
        if (inputString === undefined || inputString === '') {
            return undefined
        }
        return isExpr ? {expr: inputString} : typedValue(inputString)
    }
    const updatedPropertyValue = (inputString: string) => {
        // const inputString = (event.target as HTMLInputElement).value
        return valueToSend(inputString, expr)
    }

    const toggleKind = () => {
        setExpr(!expr)

        const currentInputString = valueIsExpr ? (value as PropertyExpr).expr : value?.toString()
        const newValueIsExpr = !valueIsExpr
        const newValue = type=== 'boolean' && !newValueIsExpr ? undefined : valueToSend(currentInputString, newValueIsExpr)
        onChange(elementId, name, newValue)
    }

    const initialInputValue = value === undefined ? '' : isExpr(value) ? value.expr : value

    const numericProps = type === 'number' ? {inputProps: {pattern: '[0-9]*'}} : {}
    const label = startCase(name)
    const buttonColor = expr ? 'secondary' : 'primary'
    const buttonMessage = expr ? 'Expression.  Click to change to fixed value' : 'Fixed value.  Click to change to expression'

    return <div style={{display: 'inline-flex'}} className='property-input'>
        <Button variant='outlined' disableElevation size='small' sx={{padding: '4px 2px', minWidth: '3rem'}} color={buttonColor} onClick={toggleKind} title={buttonMessage}>{buttonLabel}</Button>
        {type === 'boolean' && !expr ?
            <FormControl variant="filled" size='small' sx={{ minWidth: 120 }}>
                <InputLabel id={name + '_label'}>{label}</InputLabel>
                <Select
                    labelId={name + '_label'}
                    id={name}
                    value={initialInputValue.toString()}
                    onChange={(event) => onChange(elementId, name, updatedPropertyValue(event.target.value))}
                >
                    <MenuItem><em>default</em></MenuItem>
                    <MenuItem value={'true'}>Yes</MenuItem>
                    <MenuItem value={'false'}>No</MenuItem>
                </Select>
            </FormControl>
            :
            <TextField {...numericProps} id={name} label={label} variant='filled' size='small' sx={{flex: 1}}
                       value={initialInputValue}
                       onChange={(event) => onChange(elementId, name, updatedPropertyValue(event.target.value))}/>
        }
    </div>
}