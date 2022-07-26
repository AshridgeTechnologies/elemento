import React, {ChangeEvent} from 'react'
import Element from '../model/Element'
import {Box, Stack, TextField, Typography} from '@mui/material'
import {OnChangeFn} from './Types'
import PropertyInput from './PropertyInput'
import {PropertyType, PropertyValue} from '../model/Types'
import {startCase} from 'lodash'

export default function PropertyEditor({element, onChange, errors = {}}: {element: Element, onChange: OnChangeFn, errors?: object }) {

    function propertyField<T extends Element>(name: string, type: PropertyType = 'string', fixedOnly = false) {
        const propertyValue = (element.properties)[name as keyof object] as unknown as PropertyValue
        const error = errors[name as keyof object]
        const errorProps = error ? {error} : {}
        return <PropertyInput key={`${element.id}.${name}.kind`} elementId={element.id} name={name} type={type} value={propertyValue} onChange={onChange} fixedOnly={fixedOnly} {...errorProps}/>
    }

    function propertyFields() {
        const fields = element.propertyDefs.map(({name, type, fixedOnly}) => propertyField(name, type, fixedOnly))
        return <>
                {fields}
            </>
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