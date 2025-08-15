import React, {useState} from 'react'
import Element from '../model/Element'
import {Box, IconButton, Stack, TextField, TextFieldProps, Typography} from '@mui/material'
import {OnChangeFn, OnNameSelectedFn, OnSearchFn} from './Types'
import PropertyInput from './PropertyInput'
import {PropertyDef, PropertyType, PropertyValue, StylingProps} from '../model/Types'
import lodash from 'lodash'
import {FILES_ID, TOOLS_ID} from '../model/Project'
import {StylesPropertyEditor} from './StylesPropertyEditor'
import {HighlightedTextField} from './HighlightedTextField'
import Search from '@mui/icons-material/Search'

const {startCase} = lodash

function NameTextField(props: TextFieldProps & {readOnly: boolean, highlightRegex?: RegExp}) {
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

    return <HighlightedTextField {...props}
                      variant='outlined'
                      size='small'
                      readOnly={props.readOnly}
                      sx={{flexGrow: 0.7 }}
                      slotProps={{
                          input: {sx: {fontSize: 20}},
                      }}
                      value={changedValue ?? props.value}
                      data-eltype='elementName'
                      label='Name'
                      onChange={onChange}
                      onBlur={onFinishChange}
                      onKeyDown={onKeyDown}
                      helperText={changedValue !== undefined ? 'Renaming - Enter to confirm' : undefined}
                      highlightRegex={props.highlightRegex}

    />
}

function NotesTextField(props: TextFieldProps & {highlightRegex?: RegExp}) {
    const [changedValue, setChangedValue] = useState<string | undefined>(undefined)
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => setChangedValue(event.target.value)
    const onFinishChange = () => {
        if (changedValue !== undefined && changedValue !== props.value) {
            props.onChange?.({target: {value: changedValue ?? ''}} as any)
        }
        setChangedValue(undefined)
    }

    return <HighlightedTextField {...props}
                      variant='filled' size='small'
                      sx={{width: '100%'}}
                      multiline
                      value={changedValue ?? props.value ?? ''}
                      data-eltype='elementNotes'
                      label='Notes'
                      onChange={onChange}
                      onBlur={onFinishChange}
                      highlightRegex={props.highlightRegex}
    />
}

export default function PropertyEditor({element, propertyDefs, onChange, onNameSelected, onSearch, errors = {}, search}: {element: Element, propertyDefs: PropertyDef[], onChange: OnChangeFn, onNameSelected: OnNameSelectedFn, onSearch: OnSearchFn, errors?: object, search?: RegExp }) {

    function propertyField(name: string, type: PropertyType = 'string', fixedOnly: boolean) {
        const propertyValue = (element.properties)[name as keyof object] as unknown as PropertyValue
        const error = errors[name as keyof object]
        const key = `${element.id}.${name}.kind`
        if (type === 'styles') {
            return <StylesPropertyEditor key={key} elementId={element.id} name={name} value={propertyValue as StylingProps} onChange={onChange} onNameSelected={onNameSelected} errors={error} search={search}/>
        }
        return <PropertyInput key={key} elementId={element.id} name={name} type={type} value={propertyValue} onChange={onChange} onNameSelected={onNameSelected} fixedOnly={fixedOnly}
                              error={error} search={search}/>
    }

    const children = propertyDefs.map(({name, type, fixedOnly}) => propertyField(name, type, fixedOnly ?? false))
    const readOnly = element.id === FILES_ID || element.id === TOOLS_ID
    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => onChange(element.id, 'name', (event.target as HTMLInputElement).value)
    const onNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => onChange(element.id, 'notes', (event.target as HTMLInputElement).value)
    const onSearchForElement = () => {
        onSearch(element.codeName)
    }
    return <Box
        component="form"
        sx={{
            '& > :not(style)': {m: 0.5, width: 'calc(100% - 20px)'},
        }}
        noValidate
        autoComplete="off"
    >
        <Stack direction='row' spacing={2}>
            <NameTextField id='name' value={element.name} readOnly={readOnly} onChange={onNameChange} highlightRegex={search}/>
            <TextField id="formulaName" label="Formula Name" variant='filled' size='small' value={element.codeName} slotProps={{ input: {readOnly: true}}}
                       sx={{flexGrow: 0.3}}/>
            <IconButton size='large' aria-label='search for this element' title='search for this element' onClick={onSearchForElement} sx={{padding: '0 0 0 8px', marginLeft: '0 !important'}}>
                <Search sx={{fontSize: '1.9rem'}}/>
            </IconButton>
        </Stack>
        <Stack direction='row' spacing={2} alignItems='baseline'>
            <Typography data-testid="elementType" variant='body1'>{startCase(element.kind)}</Typography>
            <Typography data-testid="elementId" variant='body2' title='Elemento internal id for this element'>{element.id}</Typography>
        </Stack>
        <NotesTextField id='notes' value={element.notes} onChange={onNotesChange} highlightRegex={search}/>
        <Typography data-testid="elementErrors" variant='body2' color='red' title='Errors for this element'>{errors['element' as keyof object]}</Typography>
        {children}
    </Box>
}

