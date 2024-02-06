import {pick, without} from 'ramda'
import {commonStylingProps} from '../../model/StylingTypes'
import {camel} from 'radash'
import BaseType from '../types/BaseType'
import {Icon as MuiIcon, IconButton, InputAdornment, Tooltip} from '@mui/material'
import React from 'react'
import {definedPropertiesOf} from '../../util/helpers'
import {PropVal, StylesProps} from '../runtimeFunctions'

export type BaseInputComponentProperties =
    Readonly<{
        path: string,
        label?: PropVal<string>,
        readOnly?: PropVal<boolean>,
        show?: PropVal<boolean>,
        styles?: StylesProps
    }>

export const typographyStyles = [
    'font',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'lineHeight',
]

export const inputComponentStyles = [
    'color',
    ...typographyStyles]
export const fieldsetComponentStyles = [
    'background',
    'backgroundAttachment',
    'backgroundColor',
    'backgroundImage',
    'border',
    'borderBottom',
    'borderColor',
    'borderLeft',
    'borderRadius',
    'borderRight',
    'borderSpacing',
    'borderTop',
    'borderWidth',
]
export const inputElementStyles = [
    'padding',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'textAlign',
]
export const formControlStyles = without([...inputComponentStyles, ...fieldsetComponentStyles, ...inputElementStyles], commonStylingProps.map(camel))

export function InfoButton(props: { description: string }) {
    return <Tooltip title={props.description} placement='top-end'>
        <IconButton edge='end' sx={{px: 0.15, marginRight: '-16px'}}>
            <MuiIcon aria-label='Help' sx={{fontSize: '0.8em', color: 'action.active', ml: 0.5, mr: 1, mt: 0.25}}>info_outlined</MuiIcon>
        </IconButton>
    </Tooltip>
}

export const sxFieldSetProps = (styles: {}) => ({...pick(fieldsetComponentStyles, styles), zIndex: -1})
export const sxPropsForFormControl = (styles: {}, show: boolean, additionalProps: {} = {}) => {
    const showProps = show ? {} : {display: 'none'}
    return {...pick(formControlStyles, styles), fieldset: sxFieldSetProps(styles), ...additionalProps, ...showProps}
}

export const propsForInputComponent = (dataType: BaseType<any, any> | undefined, styles: {}) => {
    const description = dataType?.description
    const endAdornment = description ? <InputAdornment position='end' sx={{marginLeft: 0}}>{InfoButton({description})}</InputAdornment> : null
    const inputBaseSxProps = pick(inputComponentStyles, styles)
    return Object.keys(inputBaseSxProps).length > 0 || endAdornment ? {InputProps: {sx: inputBaseSxProps, endAdornment}} : {}
}
export const getLabelWithRequired = (dataType: BaseType<any, any> | undefined, label: string | undefined) => dataType?.required ? <>
    <span>{label ?? ''}</span><span
    style={{color: 'red'}}> *</span></> : label

export const inputElementProps = (styles: {}, readOnly: boolean, dataTypeProps: { [p: string]: any }) => {
    const inputElementStyleProps = pick(inputElementStyles, styles)
    const inputElementStyleAttr = Object.keys(inputElementStyleProps).length > 0 ? {style: inputElementStyleProps} : {}

    const inputPropsValues = {...dataTypeProps, ...definedPropertiesOf({readOnly}), ...inputElementStyleAttr}
    return Object.keys(inputPropsValues).length > 0 ? {inputProps: inputPropsValues} : {}
}
