import React from 'react'
import {startCase} from 'lodash'
import Element from '../model/Element'
import Text from '../model/Text'
import {Box, TextField} from '@mui/material'
import {OnChangeFn} from './Types'
import Page from '../model/Page'
import TextInput from '../model/TextInput'
import UnsupportedValueError from '../util/UnsupportedValueError'

export default function PropertyEditor(props: {element: Element, onChange: OnChangeFn }) {
    const {element, onChange} = props
    const handleChange = (propertyName: string) => (event: any) => {
        const newValue = event.target.value
        onChange(element.id, propertyName, newValue)
    }

    function propertyField<T extends Element>(name: string) {
        return <TextField id={name} label={startCase(name)} variant='filled' size='small' value={(element as T)[name as keyof T] || ''}
                          onChange={handleChange(name)}/>
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
                </>

            case "TextInput":
                return <>
                    {propertyField<TextInput>('initialValue')}
                    {propertyField<TextInput>('maxLength')}
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
            {propertyField<TextInput>('name')}
            {children}
        </Box>
    }

    return <div>Unknown element type {element.constructor.name}</div>
}