import React, {useState} from 'react'
import Element from '../model/Element'
import {Box, Button, Stack, TextField, TextFieldProps, Typography} from '@mui/material'
import {OnChangeFn} from './Types'
import PropertyInput from './PropertyInput'
import {PropertyType, PropertyValue} from '../model/Types'
import lodash from 'lodash';
import Project, {FILES_ID, TOOLS_ID} from '../model/Project'

const {startCase} = lodash;

function NameTextField(props: TextFieldProps) {
    const [changedValue, setChangedValue] = useState<string | undefined>(undefined)
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => setChangedValue(event.target.value)
    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            onFinishChange()
        }
    }
    const onFinishChange = () => {
        if (changedValue !== undefined && changedValue !== props.value) {
            props.onChange?.({target: {value: changedValue ?? ''}} as any)
        }
        setChangedValue(undefined)
    }

    return <TextField {...props}  value={changedValue ?? props.value}
                      data-eltype='elementName'
                      label='Name'
                      onChange={onChange}
                      onBlur={onFinishChange}
                      onKeyDown={onKeyDown}
                      helperText={changedValue !== undefined ? 'Renaming - Enter to confirm' : undefined}
    />
}

export default function PropertyEditor({project, element, onChange, errors = {}}: {project: Project, element: Element, onChange: OnChangeFn, errors?: object }) {

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
    const readOnly = element.id === FILES_ID || element.id === TOOLS_ID
    if (children) {
        const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => onChange(element.id, 'name', (event.target as HTMLInputElement).value)
        return <Box
            component="form"
            sx={{
                '& > :not(style)': { m: 0.5, width: 'calc(100% - 20px)' },
            }}
            noValidate
            autoComplete="off"
        >
            <Stack direction='row' spacing={2}>
                <NameTextField id='name' variant='outlined' size='small' value={element.name}
                           onChange={ onNameChange }
                           sx={{flexGrow: 0.7 }} InputProps={{sx: {fontSize: 20}}} inputProps={{readOnly}}/>
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