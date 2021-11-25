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
        return <TextField id={name} label={startCase(name)} variant='outlined' size='small' value={(element as T)[name as keyof T] || ''}
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
                const text = element as Text
                return <>
                    <TextField id="content" label="Content" variant='outlined' size='small' value={text.contentExpr}
                               onChange={handleChange('contentExpr')}/>
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
                '& > :not(style)': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
        >
            <TextField id="id" label="Id" variant='outlined' size='small' value={element.id} disabled/>
            <TextField id="name" label="Name" variant='outlined' size='small' value={element.name}
                       onChange={handleChange('name')}/>
            {children}
        </Box>
    }

    return <div>Unknown element type {element.constructor.name}</div>
}