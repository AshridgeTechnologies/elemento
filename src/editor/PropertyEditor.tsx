import React, {ChangeEvent} from 'react'
import Element from '../model/Element'
import Text from '../model/Text'
import {Box, TextField} from '@mui/material'
import {OnChangeFn} from './Types'
import Page from '../model/Page'
import TextInput from '../model/TextInput'
import UnsupportedValueError from '../util/UnsupportedValueError'
import PropertyInput from './PropertyInput'
import {PropertyType, PropertyValue} from '../model/Types'
import Button from '../model/Button'
import NumberInput from '../model/NumberInput'
import TrueFalseInput from '../model/TrueFalseInput'
import SelectInput from '../model/SelectInput'

export default function PropertyEditor({element, onChange, errors = {}}: {element: Element, onChange: OnChangeFn, errors?: object }) {

    function propertyField<T extends Element>(name: string, type: PropertyType = 'string') {
        const propertyValue = (element as T)[name as keyof T] as unknown as PropertyValue
        const error = errors[name as keyof object]
        const errorProps = error ? {error} : {}
        return <PropertyInput key={`${element.id}.${name}.kind`} elementId={element.id} name={name} type={type} value={propertyValue} onChange={onChange} {...errorProps}/>
    }

    function propertyFields() {

        switch(element.kind) {
            case "App":
                return null

            case "Page":
                return <>
                    {propertyField<Page>('style')}
                </>

            case "Text":
                return <>
                    {propertyField<Text>('content', 'string multiline')}
                    {propertyField<Text>('fontSize', 'number')}
                    {propertyField<Text>('fontFamily', 'string')}
                    {propertyField<Text>('color', 'string')}
                    {propertyField<Text>('backgroundColor', 'string')}
                    {propertyField<Text>('border', 'number')}
                    {propertyField<Text>('borderColor', 'string')}
                    {propertyField<Text>('display', 'boolean')}
                    {propertyField<Text>('width', 'number')}
                    {propertyField<Text>('height', 'number')}
                </>

            case "TextInput":
                return <>
                    {propertyField<TextInput>('initialValue')}
                    {propertyField<TextInput>('maxLength', 'number')}
                    {propertyField<TextInput>('multiline', 'boolean')}
                    {propertyField<TextInput>('label')}
                </>

            case "NumberInput":
                return <>
                    {propertyField<NumberInput>('initialValue', 'number')}
                    {propertyField<NumberInput>('label')}
                </>

            case "SelectInput":
                return <>
                    {propertyField<SelectInput>('values', 'string list')}
                    {propertyField<SelectInput>('initialValue', 'string')}
                    {propertyField<SelectInput>('label')}
                </>

            case "TrueFalseInput":
                return <>
                    {propertyField<TrueFalseInput>('initialValue', 'boolean')}
                    {propertyField<TrueFalseInput>('label')}
                </>

            case "Button":
                return <>
                    {propertyField<Button>('content')}
                    {propertyField<Button>('action', 'action')}
                    {propertyField<Button>('display', 'boolean')}
                </>
            default:
                throw new UnsupportedValueError(element.kind)
        }



    }

    const children = propertyFields()
    if (children) {
        return <Box
            component="form"
            sx={{
                '& > :not(style)': { m: 0.5, width: 'calc(100% - 20px)' },
            }}
            noValidate
            autoComplete="off"
        >
            <TextField id="id" label="Id" variant='filled' size='small' value={element.id} disabled/>
            <TextField id='name' label="Name" variant='filled' size='small' value={element.name}
                       onChange={ (event: ChangeEvent) => onChange(element.id, 'name', (event.target as HTMLInputElement).value)}/>
            {children}
        </Box>
    }

    return <div>Unknown element type {element.constructor.name}</div>
}