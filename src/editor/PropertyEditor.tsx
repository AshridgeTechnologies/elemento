import React, {ChangeEvent} from 'react'
import Element from '../model/Element'
import Text from '../model/Text'
import {Box, Stack, TextField, Typography} from '@mui/material'
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
import Data from '../model/Data'
import App from '../model/App'
import Project from '../model/Project'
import {Collection, List} from '../model/index'
import Layout from '../model/Layout'
import AppBar from '../model/AppBar'
import {startCase} from 'lodash'

export default function PropertyEditor({element, onChange, errors = {}}: {element: Element, onChange: OnChangeFn, errors?: object }) {

    function propertyField<T extends Element>(name: string, type: PropertyType = 'string', fixedOnly = false) {
        const propertyValue = (element.properties)[name as keyof object] as unknown as PropertyValue
        const error = errors[name as keyof object]
        const errorProps = error ? {error} : {}
        return <PropertyInput key={`${element.id}.${name}.kind`} elementId={element.id} name={name} type={type} value={propertyValue} onChange={onChange} fixedOnly={fixedOnly} {...errorProps}/>
    }

    function propertyFields() {

        switch(element.kind) {
        case 'Project':
            return <>
                {propertyField<Project>('author')}
            </>

        case 'App':
            return <>
                {propertyField<App>('author', 'string')}
                {propertyField<App>('maxWidth', 'string|number')}
            </>

        case 'Page':
            return <>
                {propertyField<Page>('style')}
            </>

        case 'Layout':
            return <>
                {propertyField<Layout>('horizontal', 'boolean')}
                {propertyField<Layout>('width', 'string|number')}
                {propertyField<Layout>('wrap', 'boolean')}
            </>

        case 'AppBar':
            return <>
                {propertyField<AppBar>('title', 'string')}
            </>

        case 'Text':
            return <>
                {propertyField<Text>('content', 'string multiline')}
                {propertyField<Text>('fontSize', 'number')}
                {propertyField<Text>('fontFamily', 'string')}
                {propertyField<Text>('color', 'string')}
                {propertyField<Text>('backgroundColor', 'string')}
                {propertyField<Text>('border', 'number')}
                {propertyField<Text>('borderColor', 'string')}
                {propertyField<Text>('display', 'boolean')}
                {propertyField<Text>('width', 'string|number')}
                {propertyField<Text>('height', 'string|number')}
            </>

        case 'TextInput':
            return <>
                {propertyField<TextInput>('initialValue')}
                {propertyField<TextInput>('maxLength', 'number')}
                {propertyField<TextInput>('width', 'string|number')}
                {propertyField<TextInput>('multiline', 'boolean')}
                {propertyField<TextInput>('label')}
            </>

        case 'NumberInput':
            return <>
                {propertyField<NumberInput>('initialValue', 'number')}
                {propertyField<NumberInput>('label')}
            </>

        case 'SelectInput':
            return <>
                {propertyField<SelectInput>('values', 'string list')}
                {propertyField<SelectInput>('initialValue', 'string')}
                {propertyField<SelectInput>('label')}
            </>

        case 'TrueFalseInput':
            return <>
                {propertyField<TrueFalseInput>('initialValue', 'boolean')}
                {propertyField<TrueFalseInput>('label')}
            </>

        case 'Button':
            return <>
                {propertyField<Button>('content')}
                {propertyField<Button>('action', 'action')}
                {propertyField<Button>('filled', 'boolean')}
                {propertyField<Button>('display', 'boolean')}
            </>

        case 'List':
            return <>
                {propertyField<List>('items', 'expr')}
                {propertyField<List>('width', 'string|number')}
                {propertyField<List>('style')}
            </>

        case 'Data':
            return <>
                {propertyField<Data>('initialValue')}
                {propertyField<Data>('display', 'boolean')}
            </>

        case 'Collection':
            return <>
                {propertyField<Collection>('initialValue', 'expr')}
                {propertyField<Collection>('dataStore', 'expr')}
                {propertyField<Collection>('collectionName', 'string')}
                {propertyField<Collection>('display', 'boolean')}
            </>

        case 'MemoryDataStore':
            return <>
                {propertyField<Collection>('initialValue', 'expr')}
                {propertyField<Collection>('display', 'boolean')}
            </>

        case 'FileDataStore':
            return <>
            </>

        case 'Function':
            return <>
                {propertyField<Collection>('input1', 'string', true)}
                {propertyField<Collection>('input2', 'string', true)}
                {propertyField<Collection>('input3', 'string', true)}
                {propertyField<Collection>('input4', 'string', true)}
                {propertyField<Collection>('input5', 'string', true)}
                {propertyField<Collection>('calculation', 'expr')}
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
            <Stack direction='row' spacing={2}>
                <TextField id='name' variant='outlined' size='small' value={element.name}
                           onChange={ (event: ChangeEvent) => onChange(element.id, 'name', (event.target as HTMLInputElement).value)}
                           sx={{flexGrow: 0.7 }} InputProps={{sx: {fontSize: 20}}}/>
                <TextField id="formulaName" label="Formula Name" variant='filled' size='small' value={element.codeName} inputProps={{readOnly: true}} sx={{flexGrow: 0.3}}/>
            </Stack>
            <Stack direction='row' spacing={2} alignItems='baseline'>
                <Typography data-testid="elementType" variant='body1'>{startCase(element.kind)}</Typography>
                <Typography data-testid="elementId" variant='body2' title='Elemento internal id for this element'>{element.id}</Typography>
            </Stack>
            {children}
        </Box>
    }

    return <div>Unknown element type {element.constructor.name}</div>
}