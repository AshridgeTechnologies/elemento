import React, {ChangeEvent, useContext} from 'react'
import Element from '../model/Element'
import {Box, Button, Stack, TextField, Typography} from '@mui/material'
import {OnChangeFn} from './Types'
import PropertyInput from './PropertyInput'
import {PropertyType, PropertyValue} from '../model/Types'
import {startCase} from 'lodash'
import Project from '../model/Project'
import {ProjectContext} from './Editor'

export default function PropertyEditor({element, onChange, errors = {}}: {element: Element, onChange: OnChangeFn, errors?: object }) {

    const project = useContext(ProjectContext) as Project

    function propertyField<T extends Element>(name: string, type: PropertyType = 'string', fixedOnly: boolean, readOnly: boolean) {
        const valueFromElement = element[name as keyof object] as unknown as PropertyValue
        const valueFromProps = (element.properties)[name as keyof object] as unknown as PropertyValue
        const propertyValue = readOnly ? valueFromElement : valueFromProps
        const error = errors[name as keyof object]
        const errorProps = error ? {error} : {}
        return <PropertyInput key={`${element.id}.${name}.kind`} elementId={element.id} name={name} type={type} value={propertyValue} onChange={onChange} fixedOnly={fixedOnly} readOnly={readOnly} {...errorProps}/>
    }

    function actionButton<T extends Element>(name: string) {
        const onClick = () => (element[name as keyof object] as (proj: Project) => void)(project)
        return <Button key={`${element.id}.${name}.kind`} variant='outlined' onClick={onClick}>{startCase(name)}</Button>
    }

    function propertyFieldsAndActions() {
        const fields = element.propertyDefs.map(({name, type, fixedOnly, readOnly}) => propertyField(name, type, fixedOnly ?? false, readOnly ?? false))
        const actions = element.actionDefs.map(({name}) => actionButton(name))
        return <>
                {fields}
                {actions}
            </>
    }

    const children = propertyFieldsAndActions()
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