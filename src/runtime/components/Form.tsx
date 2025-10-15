import React, {createElement, Fragment, KeyboardEventHandler} from 'react'
import {valueOfProps} from '../runtimeFunctions'
import {Box, FormHelperText, Stack, SxProps, Typography} from '@mui/material'
import BaseFormState from './FormState'
import {isArray} from 'lodash'
import BaseType from '../types/BaseType'
import TextInput from './TextInput'
import NumberInput from './NumberInput'
import {withDots} from '../../util/helpers'
import SelectInput from './SelectInput'
import TrueFalseInput from './TrueFalseInput'
import DateInput from './DateInput'
import {isNil, last, without} from 'ramda'
import {BaseInputComponentProperties, InfoButton, sxProps} from './ComponentHelpers'
import {use$state} from '../state/appStateHooks'
import {ElementMetadata, ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'
import {InputComponentMetadata} from './InputComponentState'
import {ChoiceType, DateType, DecimalType, NumberType, TextType, TrueFalseType} from '../types'

const errorsToString = (errors: string[] | {[p: string]: string[]}) => {
    if (isArray(errors)) {
        return(errors as string[]).join('.  ')
    } else {
        const {_self: formErrors, ...childErrors} = errors
        return
    }
}

type Properties = BaseInputComponentProperties & { horizontal?: boolean, wrap?: boolean, keyAction?: KeyboardEventHandler, children?: any }

const formField = (parentPath: string, type: BaseType<any, any>, initialValue: any) => {
    const {name, codeName} = type
    const path = withDots(parentPath, codeName)
    if (type.kind === 'Text') {
        return <TextInput path={path} label={name} dataType={type as TextType} initialValue={initialValue} key={path}/>
    }
    if (type.kind === 'Number') {
        return <NumberInput path={path} label={name} dataType={type as NumberType} initialValue={initialValue} key={path}/>
    }
    if (type.kind === 'Decimal') {
        return <NumberInput path={path} label={name} dataType={type as DecimalType} initialValue={initialValue}  key={path}/>
    }
    if (type.kind === 'Choice') {
        return <SelectInput path={path} label={name} dataType={type as ChoiceType} initialValue={initialValue}  key={path}/>
    }
    if (type.kind === 'TrueFalse') {
        return <TrueFalseInput path={path} label={name} dataType={type as TrueFalseType} initialValue={initialValue}  key={path}/>
    }
    if (type.kind === 'Date') {
        return <DateInput path={path} label={name} dataType={type as DateType} initialValue={initialValue}  key={path}/>
    }
    if (type.kind === 'Record') {
        return <Form path={path} label={name} key={path}/>
    }
    // if (type.kind === 'List') {
    //     return <ListElement path={path} key={path}/>
    // }

    return <div>{`unknown type ${type}`}</div>
}


export const FormSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Form",
    "description": "Description of Form",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "Form",
    "icon": "dns",
    "elementType": "statefulUI",
    "canContain": "elementsWithThisParentType",
    "parentType": ["Page", "Form", "Block"],
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "$ref": "#/definitions/BaseInputProperties",
            "properties": {
                "initialValue": {
                    "description": "The ",
                    "$ref": "#/definitions/Expression"
                },
                "horizontal": {
                    "description": "The ",
                    "$ref": "#/definitions/BooleanOrExpression",
                    "default": false
                },
                "wrap": {
                    "description": "The ",
                    "$ref": "#/definitions/BooleanOrExpression",
                    "default": false
                },
                "keyAction": {
                    "description": "The ",
                    "$ref": "#/definitions/ActionExpression",
                    "argNames": ["$event"]
                },
                "submitAction": {
                    "description": "The ",
                    "$ref": "#/definitions/ActionExpression",
                    "argNames": ["$form", "$data"]
                },
            }
        },
        "elements": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/BaseElement"
            }
        }
    },
    "required": [
        "kind",
        "properties"
    ],
    "unevaluatedProperties": false,
    "definitions": Definitions
}

export const FormMetadata: ElementMetadata = {
    stateProps: ['submitAction', 'initialValue', ...(InputComponentMetadata.stateProps ?? [])]
}

export default function Form({children, path, ...props}: Properties) {
    const {horizontal = false, wrap = false, show, label, keyAction, styles = {}} = valueOfProps(props)
    const direction = horizontal ? 'row' : 'column'
    const flexWrap = wrap ? 'wrap' : 'nowrap'
    const sx = {
        py: horizontal ? 0 : 1,
        overflow: horizontal ? 'visible' : 'scroll',
        minHeight: '3em',
        maxHeight: '100%',
        boxSizing: 'border-box',
        alignItems: horizontal ? 'baseline' : 'flex-start',
        padding: horizontal ? 0 : 1,
        ...sxProps(styles, show)
    } as SxProps

    const state = use$state(path) as BaseFormState
    const dataType = state.dataType
    const error = state.errorsShown && !state.valid
    const helperText = state.errorsShown && state.errors?._self ? errorsToString(state.errors._self) : undefined

    const dataTypeFields = dataType?.fields ?? []

    const childrenList:React.CElement<any, any>[] = isNil(children) ? [] : typeof children[Symbol.iterator] === 'function' ? Array.from(children) : [children]

    function fieldName(el: React.ComponentElement<any, any>) {
        return last(el.props.path.split('.'))
    }

    const overrideChildren = childrenList.filter( (el: React.CElement<any, any>) => {
        return dataTypeFields.some( f => f.name === fieldName(el) )
    })
    const additionalChildren = without<any>(overrideChildren, childrenList)
    const dataTypeChildren = dataTypeFields.map( (type) => {
        const override = overrideChildren.find(el => type.name === fieldName(el))
        return override
            ?? formField(path, type, state.originalValue[type.codeName as keyof object])
    }) ?? []
    const formChildrenFragment = createElement(Fragment, {}, ...dataTypeChildren, ...additionalChildren)

    const infoButton = dataType?.description ? <InfoButton description = {dataType?.description}/> : null
    return <Box id={path} onKeyDown={keyAction}>
        <Typography variant='h6'>{label}{infoButton}</Typography>
        <Stack
            direction={direction}
            flexWrap={flexWrap}
            justifyContent='flex-start'
            alignItems='flex-start'
            spacing={2}
            sx={sx}>
            {formChildrenFragment}
        </Stack>
        {error ? <FormHelperText error={error}>{helperText}</FormHelperText> : null}
    </Box>
}

Form.Schema = FormSchema
Form.Metadata = FormMetadata
