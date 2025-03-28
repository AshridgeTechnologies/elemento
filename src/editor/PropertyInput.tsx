import React, {useState} from 'react'
import {ElementId, EventActionPropertyDef, PropertyExpr, PropertyType, PropertyValue} from '../model/Types'
import lodash from 'lodash';
import {Button, FormControl, InputLabel, MenuItem, Select, TextField} from '@mui/material'
import {isExpr, isNumeric, wordAtPosition} from '../util/helpers'
import {OnChangeFn, OnNameSelectedFn} from './Types'
import UnsupportedValueError from '../util/UnsupportedValueError'
import {format} from 'date-fns'
import {editorMenuPositionProps} from './Editor'
import {editorElement} from './EditorElement'
import {HighlightedTextField} from './HighlightedTextField'

const {isArray, startCase} = lodash


type PropertyInputProps = {
    elementId: ElementId, name: string, type: PropertyType, value: PropertyValue | undefined,
    onChange: OnChangeFn, onNameSelected: OnNameSelectedFn, fixedOnly?: boolean, readOnly?: boolean, error?: string, search?: RegExp
}

export default function PropertyInput({ elementId, name, type, value, onChange, onNameSelected, fixedOnly = false, readOnly = false,  error, search}: PropertyInputProps) {
    const isEventAction = (type as EventActionPropertyDef).type === 'Action'
    const exprOnlyProperty = isEventAction || type === 'expr'
    const valueIsExpr = value !== undefined && isExpr(value) || exprOnlyProperty
    const [expr, setExpr] = useState(valueIsExpr)

    const fixedBoolean = type === 'boolean' && !expr
    const fixedChoiceList = isArray(type) && !expr
    const fixedNumber = type === 'number' && !expr
    const fixedDate = type === 'date' && !expr
    const multiline = type === 'string multiline' || expr

    const typedValue = (input: string): PropertyValue => {
        if (isArray(type) || isEventAction) {
            return input
        }
        switch (type) {
            case 'string':
            case 'string multiline':
                return input
            case 'number':
                return Number(input)
            case 'string list':
                return input.trim().split(/ *, */)
            case 'string|number':
                return isNumeric(input) ? Number(input) : input
            case 'boolean':
                return input === 'true'
            case 'date':
                return new Date(input)
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
        if (value === undefined || value === null) {
            return ''
        } else if (isExpr(value)) {
            return value.expr
        } else if (isArray(value)) {
            return value.join(', ')
        } else if (value instanceof Date) {
            return format(value, 'yyyy-MM-dd')
        } else {
            return value.toString()
        }
    }

    const toggleKind = () => {
        setExpr(!expr)

        const currentInputString = valueIsExpr ? (value as PropertyExpr).expr : value?.toString()
        const newValueIsExpr = !valueIsExpr
        const newValue = type=== 'boolean' && !newValueIsExpr ? undefined : valueToSend(currentInputString, newValueIsExpr)
        onChange(elementId, name, newValue)
    }

    const fixedButtonLabel = () => {
        if (isArray(type)) return 'sel'
        switch (type) {
            case 'date':
                return 'dmy'
            case 'number':
                return '123'
            case 'boolean':
                return 'y/n'
            case 'string|number':
                return 'a12'
            default:
                return 'abc'
        }
    }

    const numericProps = fixedNumber ? {type: 'number', slotProps: {htmlInput: {min: 0}}, sx: { minWidth: 120, flex: 0 }} : {}
    const dateProps = fixedDate ? {type: 'date', slotProps:{inputLabel: {shrink: true }}, sx: { minWidth: 150, flex: 0 }} : {}
    const label = startCase(name)
    const fixedButtonColor = 'primary'
    const exprButtonColor = 'secondary'
    const exprButtonLabel = 'fx='
    const buttonLabel = expr ? exprButtonLabel : fixedButtonLabel()
    const buttonColor = expr ? exprButtonColor : fixedButtonColor
    const buttonMessage = expr ? 'Expression.  Click to change to fixed value' : 'Fixed value.  Click to change to expression'
    const errorProps = error ? {error: true, helperText: error} : {}

    const button = () => {
        const commonProps = {
            variant: 'outlined', disableElevation: true, size: 'small',
            sx:{padding: '4px 2px', minWidth: '3rem', maxHeight: '2.6rem'},
            'data-eltype': 'propertyTypeButton'
        } as any
        if (readOnly) {
            return null
        }

        if (exprOnlyProperty) {
            return <Button {...commonProps} color={exprButtonColor} disabled title={'Expression required'}>{exprButtonLabel}</Button>
        }

        if (fixedOnly) {
            return <Button {...commonProps} color={buttonColor} disabled title={'Fixed value required'}>{buttonLabel}</Button>
        }

        return <Button {...commonProps} color={buttonColor} onClick={toggleKind} title={buttonMessage}>{buttonLabel}</Button>
    }

    const onClick = (event: React.MouseEvent) => {
        if (expr && (event.ctrlKey || event.metaKey)) {
            const target = event.target as HTMLTextAreaElement
            const wordClicked = wordAtPosition(target.value, target.selectionStart)
            if (wordClicked) {
                onNameSelected(wordClicked)
            }
        }
    }

    return <div style={{display: 'inline-flex'}} className='property-input'>
        {button()}
        {fixedBoolean ?
            <FormControl variant="filled" size='small' sx={{ minWidth: 240 }}>
                <InputLabel id={name + '_label'}>{label}</InputLabel>
                <Select
                    labelId={name + '_label'}
                    id={name}
                    value={initialInputValue()}
                    onChange={(event) => onChange(elementId, name, updatedPropertyValue(event.target.value))}
                    MenuProps={{ container: editorElement(), slotProps: editorMenuPositionProps}}
                >
                    <MenuItem value={''}><em>default</em></MenuItem>
                    <MenuItem value={'true'}>Yes</MenuItem>
                    <MenuItem value={'false'}>No</MenuItem>
                </Select>
            </FormControl>
            : fixedChoiceList ?
            <FormControl variant="filled" size='small' sx={{ minWidth: 240 }}>
                <InputLabel id={name + '_label'}>{label}</InputLabel>
                <Select
                    labelId={name + '_label'}
                    id={name}
                    value={initialInputValue()}
                    onChange={(event) => onChange(elementId, name, updatedPropertyValue(event.target.value))}
                >
                    <MenuItem value={''}><em>default</em></MenuItem>
                    {type.map( choiceVal => <MenuItem value={choiceVal} key={choiceVal}>{startCase(choiceVal)}</MenuItem>)}
                </Select>
            </FormControl>
            : (fixedNumber || fixedDate) ?
                <TextField id={name} label={label} variant='filled' size='small' sx={{flex: 1}}
                           value={initialInputValue()}
                           slotProps={{input: {readOnly, sx:{fontFamily: 'monospace', fontSize: '13px'}}}}
                           {...numericProps}
                           {...dateProps}
                           {...errorProps}
                           onChange={(event) => onChange(elementId, name, updatedPropertyValue(event.target.value))}
                           onClick={onClick}
                />
            : <HighlightedTextField id={name}
                sx={{width: '100%'}}
                label={label}
                multiline={multiline}
                readOnly={readOnly}
                value={initialInputValue()}
                {...errorProps}
                onChange={(event) => onChange(elementId, name, updatedPropertyValue(event.target.value))}
                onClick={onClick}
                highlightRegex={search}
                />
        }
    </div>
}
