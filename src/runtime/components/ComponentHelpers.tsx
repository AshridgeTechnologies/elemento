import {pick, without} from 'ramda'
import {commonStylingPropNames, defaultUnits} from '../../util/StylingTypes'
import {camel, mapValues} from 'radash'
import BaseType from '../types/BaseType'
import {Icon as MuiIcon, IconButton, InputAdornment, SxProps, Tooltip} from '@mui/material'
import React, {createContext, useRef, useState} from 'react'
import {definedPropertiesOf, isNumericAnySign} from '../../util/helpers'
import {PropVal, StylesProps, StylesPropVals} from '../runtimeFunctions'
import {DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, UniqueIdentifier, useSensor, useSensors} from '@dnd-kit/core'

export type BaseInputComponentProperties =
    Readonly<{
        path: string,
        label?: PropVal<string>,
        readOnly?: PropVal<boolean>,
        show?: PropVal<boolean>,
        styles?: StylesPropVals
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
export const formControlStyles = without([...inputComponentStyles, ...fieldsetComponentStyles, ...inputElementStyles], commonStylingPropNames.map(camel))

export function InfoButton(props: { description: string }) {
    return <Tooltip title={props.description} placement='top-end'>
        <IconButton edge='end' sx={{px: 0.15, marginRight: '-16px'}}>
            <MuiIcon aria-label='Help' sx={{fontSize: '0.8em', color: 'action.active', ml: 0.5, mr: 1, mt: 0.25}}>info_outlined</MuiIcon>
        </IconButton>
    </Tooltip>
}

export const sxProps = (styles: StylesProps, show?: boolean): SxProps<{}> => {
    const stylesWithDefaultUnits = mapValues(styles as object,
        (value, name) => value !== undefined && isNumericAnySign(String(value)) && name in defaultUnits ? value + defaultUnits[name] : value)

    const showProps = show !== undefined && !show ? {display: 'none'} : {}

    return {
        ...stylesWithDefaultUnits,
        ...showProps
    }
}
export const sxFieldSetProps = (styles: {}) => sxProps({...pick(fieldsetComponentStyles, styles), zIndex: -1})
export const sxPropsForFormControl = (styles: {}, show: boolean, additionalProps: {} = {}) => ({
    ...additionalProps,
    ...sxProps(pick(formControlStyles, styles), show),
    fieldset: sxFieldSetProps(styles)
}) as SxProps<{}>

export const propsForInputComponent = (dataType: BaseType<any, any> | undefined, styles: {}) => {
    const description = dataType?.description
    const endAdornment = description ? <InputAdornment position='end' sx={{marginLeft: 0}}>{InfoButton({description})}</InputAdornment> : null
    const inputBaseSxProps = sxProps(pick(inputComponentStyles, styles))
    return Object.keys(inputBaseSxProps!).length > 0 || endAdornment ? {InputProps: {sx: inputBaseSxProps, endAdornment}} : {}
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

export const PageDndContext = createContext<React.MutableRefObject<any> | null>(null)

export function DndWrapper(props: {elementToWrap: React.FunctionComponentElement<any>}) {
    const [, setActiveId] = useState<UniqueIdentifier | null>(null)

    const onDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id)
    }

    const onDragEnd = (event: DragEndEvent) => {
        setActiveId(null)
        dndRef.current = null
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {distance: 8}
        })
    )
    const dndRef = useRef<React.ReactElement | null>(null)
    const elementInContext = React.createElement(PageDndContext.Provider, {value: dndRef}, props.elementToWrap)
    const overlay = React.createElement(DragOverlay, {dropAnimation: null}, dndRef.current)

    return React.createElement(DndContext, {onDragStart, onDragEnd, sensors}, elementInContext, overlay)
}

export function dndWrappedComponent(component: React.FunctionComponent<any>) {
    return function DndWrapped(props: any) {
        const elementToWrap = React.createElement(component, props)
        return DndWrapper({elementToWrap})
    }
}

export const globalFetch = (...args: any[]) => globalThis.fetch.apply(globalThis, args as any)
