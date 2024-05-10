import {ElementId, PropertyType, PropertyValue, StylingProps} from '../model/Types'
import {OnChangeFn, OnNameSelectedFn} from './Types'
import {withoutUndefined} from '../util/helpers'
import PropertyInput from './PropertyInput'
import {commonStylingPropTypes} from '../util/StylingTypes'
import {Box, Typography} from '@mui/material'
import React from 'react'
import {pick} from 'radash'
import {equals} from 'ramda'
import {startCase} from 'lodash'

type PresetPositionStyles = {
    position: string | undefined,
    top: string | undefined,
    left: string | undefined,
    bottom: string | undefined,
    right: string | undefined,
    translate: string | undefined
}
export const presetPositionStyles = {
    topLeft: {
        position: 'absolute',
        top: '0',
        left: '0',
    },
    topCenter: {
        position: 'absolute',
        top: '0',
        left: '50%',
        translate: '-50%'
    },
    topRight: {
        position: 'absolute',
        top: '0',
        right: '0',
    },
    middleLeft: {
        position: 'absolute',
        top: '50%',
        left: '0',
        translate: '0 -50%'
    },
    center: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        translate: '-50% -50%'
    },
    middleRight: {
        position: 'absolute',
        top: '50%',
        right: '0',
        translate: '0 -50%'
    },
    bottomLeft: {
        position: 'absolute',
        bottom: '0',
        left: '0',
    },
    bottomCenter: {
        position: 'absolute',
        bottom: '0',
        left: '50%',
        translate: '-50%'
    },
    bottomRight: {
        position: 'absolute',
        bottom: '0',
        right: '0',
    }
} as const

export const clearPresetPositionStyles = {
    position: undefined,
    top: undefined,
    left: undefined,
    bottom: undefined,
    right: undefined,
    translate: undefined
} as const

type presetStyleName = keyof typeof presetPositionStyles

const presetPositionNames = Object.keys(presetPositionStyles) as presetStyleName[]

const hasPreset = (properties: object, presetType: presetStyleName) => {
    const expectedPresetValues = {...clearPresetPositionStyles, ...presetPositionStyles[presetType]} as PresetPositionStyles
    const fromProps = {...clearPresetPositionStyles, ...pick(properties, Object.keys(expectedPresetValues) as (keyof object)[])} as PresetPositionStyles
    return equals(fromProps, expectedPresetValues)
}

const presetPosition = (stylesValue: StylingProps) => presetPositionNames.find((presetName) => hasPreset(stylesValue, presetName))

export function StylesPropertyEditor({elementId, name, value: stylesValue = {}, onChange, onNameSelected, errors = {}}: { elementId: ElementId, name: string, value: StylingProps, onChange: OnChangeFn, onNameSelected: OnNameSelectedFn, errors?: object }) {

    const onChangeStyleProperty = (_: ElementId, stylePropName: string, stylePropValue: any) => {
        const styleUpdates = () => {
            if (stylePropName === 'presetPosition') {
                const preset = presetPositionStyles[stylePropValue as presetStyleName] ?? {}
                return {...clearPresetPositionStyles, ...preset}
            }
            return  {[stylePropName]: stylePropValue}
        }

        const newStyles = withoutUndefined({...stylesValue, ...styleUpdates()})
        onChange(elementId, name, newStyles)
    }

    function propertyField(name: string, type: PropertyType = 'string') {
        const propertyValue = name === 'presetPosition' ? presetPosition(stylesValue) : stylesValue[name as keyof StylingProps] as unknown as PropertyValue
        const error = errors[name as keyof object]
        const key = `${elementId}.styles.${name}.kind`
        return <PropertyInput key={key} elementId={elementId} name={name} type={type} value={propertyValue} onChange={onChangeStyleProperty}
                              onNameSelected={onNameSelected} error={error}/>
    }

    const presetPositionField = propertyField('presetPosition', presetPositionNames)
    const fields = [presetPositionField, ...Object.entries(commonStylingPropTypes).map(([name, type]) => propertyField(name, type))]
    return <Box sx={{
        '& > :not(style)': {m: 0.5, width: 'calc(100% - 10px)'},
    }}
    >
        <Typography variant='h6'>{startCase(name)}</Typography>
        {fields}
    </Box>
}
