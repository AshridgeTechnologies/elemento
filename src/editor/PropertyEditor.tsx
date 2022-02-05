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

export default function PropertyEditor({element, onChange}: {element: Element, onChange: OnChangeFn }) {

    function propertyField<T extends Element>(name: string, type: PropertyType = 'string') {
        const propertyValue = (element as T)[name as keyof T] as unknown as PropertyValue
        return <PropertyInput key={`${element.id}.${name}.kind`} elementId={element.id} name={name} type={type} value={propertyValue} onChange={onChange}/>
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
                    {propertyField<Text>('content')}
                    {propertyField<Text>('display', 'boolean')}
                </>

            case "TextInput":
                return <>
                    {propertyField<TextInput>('initialValue')}
                    {propertyField<TextInput>('maxLength', 'number')}
                    {propertyField<TextInput>('label')}
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