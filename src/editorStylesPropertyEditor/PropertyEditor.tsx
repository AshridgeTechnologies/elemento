import React, {useState} from 'react'
import Element from '../model/Element'
import {Box, Stack, TextField, TextFieldProps, Typography} from '@mui/material'
import {OnChangeFn} from '../editor/Types'
import PropertyInput from '../editor/PropertyInput'
import {PropertyDef, PropertyType, PropertyValue, StylingProps} from '../model/Types'
import lodash from 'lodash';
import {FILES_ID, TOOLS_ID} from '../model/Project'
import {StylesPropertyEditor} from './StylesPropertyEditor'

const {startCase} = lodash;

function NameTextField(props: TextFieldProps & {readOnly: boolean}) {
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

    return <TextField {...props}
                      variant='outlined' size='small'
                      sx={{flexGrow: 0.7 }}
                      InputProps={{sx: {fontSize: 20}}}
                      inputProps={{readOnly: props.readOnly}}
                      value={changedValue ?? props.value}
                      data-eltype='elementName'
                      label='Name'
                      onChange={onChange}
                      onBlur={onFinishChange}
                      onKeyDown={onKeyDown}
                      helperText={changedValue !== undefined ? 'Renaming - Enter to confirm' : undefined}
    />
}

function NotesTextField(props: TextFieldProps) {
    const [changedValue, setChangedValue] = useState<string | undefined>(undefined)
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => setChangedValue(event.target.value)
    const onFinishChange = () => {
        if (changedValue !== undefined && changedValue !== props.value) {
            props.onChange?.({target: {value: changedValue ?? ''}} as any)
        }
        setChangedValue(undefined)
    }

    return <TextField {...props}
                      variant='filled' size='small'
                      multiline
                      value={changedValue ?? props.value ?? ''}
                      data-eltype='elementNotes'
                      label='Notes'
                      onChange={onChange}
                      onBlur={onFinishChange}
    />
}

export default function PropertyEditor({element, propertyDefs, onChange, errors = {}}: {element: Element, propertyDefs: PropertyDef[], onChange: OnChangeFn, errors?: object }) {

    function propertyField(name: string, type: PropertyType = 'string', fixedOnly: boolean, readOnly: boolean) {
        const valueFromElement = element[name as keyof object] as unknown as PropertyValue
        const valueFromProps = (element.properties)[name as keyof object] as unknown as PropertyValue
        const propertyValue = readOnly ? valueFromElement : valueFromProps
        const error = errors[name as keyof object]
        const key = `${element.id}.${name}.kind`
        if (type === 'styles') {
            return <StylesPropertyEditor key={key} elementId={element.id} value={propertyValue as StylingProps} onChange={onChange} errors={error}/>
        }
        return <PropertyInput key={key} elementId={element.id} name={name} type={type} value={propertyValue} onChange={onChange} fixedOnly={fixedOnly}
                              readOnly={readOnly} error={error}/>
    }

    const children = propertyDefs.map(({name, type, fixedOnly, readOnly}) => propertyField(name, type, fixedOnly ?? false, readOnly ?? false))
    const readOnly = element.id === FILES_ID || element.id === TOOLS_ID
    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => onChange(element.id, 'name', (event.target as HTMLInputElement).value)
    const onNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => onChange(element.id, 'notes', (event.target as HTMLInputElement).value)
    return <Box
        component="form"
        sx={{
            '& > :not(style)': {m: 0.5, width: 'calc(100% - 20px)'},
        }}
        noValidate
        autoComplete="off"
    >
        <Stack direction='row' spacing={2}>
            <NameTextField id='name' value={element.name} readOnly={readOnly} onChange={onNameChange}/>
            <TextField id="formulaName" label="Formula Name" variant='filled' size='small' value={element.codeName} inputProps={{readOnly: true}}
                       sx={{flexGrow: 0.3}}/>
        </Stack>
        <Stack direction='row' spacing={2} alignItems='baseline'>
            <Typography data-testid="elementType" variant='body1'>{startCase(element.kind)}</Typography>
            <Typography data-testid="elementId" variant='body2' title='Elemento internal id for this element'>{element.id}</Typography>
        </Stack>
        <NotesTextField id='notes' value={element.notes} onChange={onNotesChange}/>
        {children}
    </Box>
}

