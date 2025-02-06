import React, {createElement, Fragment, KeyboardEventHandler} from 'react'
import {PropVal, valueOfProps} from '../runtimeFunctions'
import {Box, FormHelperText, Stack, SxProps, Typography} from '@mui/material'
import BaseFormState, {DataTypeFormState} from './FormState'
import {isArray} from 'lodash'
import {ChoiceType, DateType, NumberType, RecordType, TextType, TrueFalseType} from '../types'
import BaseType from '../types/BaseType'
import TextInput, {TextInputState} from './TextInput'
import NumberInput, {NumberInputState} from './NumberInput'
import {withDots} from '../../util/helpers'
import SelectInput, {SelectInputState} from './SelectInput'
import TrueFalseInput, {TrueFalseInputState} from './TrueFalseInput'
import DateInput, {DateInputState} from './DateInput'
import {isNil, last, without} from 'ramda'
import DecimalType from '../types/DecimalType'
import BigNumber from 'bignumber.js'
import {BaseInputComponentProperties, InfoButton, sxProps} from './ComponentHelpers'
import {useObject} from '../appStateHooks'

const errorsToString = (errors: string[] | {[p: string]: string[]}) => {
    if (isArray(errors)) {
        return(errors as string[]).join('.  ')
    } else {
        const {_self: formErrors, ...childErrors} = errors
        return
    }
}

type Properties = BaseInputComponentProperties & { horizontal?: boolean, wrap?: boolean, keyAction?: KeyboardEventHandler, children?: any }

const formField = (parentPath: string, type: BaseType<any, any>) => {
    const {name, codeName} = type
    const path = withDots(parentPath, codeName)
    if (type.kind === 'Text') {
        return <TextInput path={path} label={name} key={path}/>
    }
    if (type.kind === 'Number') {
        return <NumberInput path={path} label={name} key={path}/>
    }
    if (type.kind === 'Decimal') {
        return <NumberInput path={path} label={name} key={path}/>
    }
    if (type.kind === 'Choice') {
        return <SelectInput path={path} label={name} key={path}/>
    }
    if (type.kind === 'TrueFalse') {
        return <TrueFalseInput path={path} label={name} key={path}/>
    }
    if (type.kind === 'Date') {
        return <DateInput path={path} label={name} key={path}/>
    }
    if (type.kind === 'Record') {
        return <Form path={path} label={name} key={path}/>
    }
    // if (type.kind === 'List') {
    //     return <ListElement path={path} key={path}/>
    // }

    return <div>{`unknown type ${type}`}</div>
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

    const state = useObject(path) as BaseFormState
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
    const dataTypeChildren = dataTypeFields.map( (type) => overrideChildren.find( el => type.name === fieldName(el)) ?? formField(path, type) ) ?? []
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

