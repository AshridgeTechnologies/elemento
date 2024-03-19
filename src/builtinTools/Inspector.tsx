import {ElementId} from '../model/Types'
import React, {useEffect, useState} from 'react'
import {Box, Stack, Typography} from '@mui/material'
import {Editor} from '../editorToolApis/EditorControllerClient'
import Project from '../model/Project'
import {isEventAction, isExpr} from '../util/helpers'
import {Preview} from '../editorToolApis/PreviewControllerClient'
import {isPlainObject} from 'lodash'
import {isArray} from 'radash'
import {equals} from 'ramda'

type DebugData = {[p: string]: any}

const displayValue = (val: any): string => {
    if (isPlainObject(val)) {
        if (equals(Object.keys(val), Object.values(val))) {
            return displayValue(Object.values(val))
        }
        return `{${Object.entries(val).map(([name, val]) => `${name}: ${displayValue(val)}`).join(', ')}}`
    } else if (isArray(val)) {
        return `[${val.map(displayValue).join(', ')}]`
    // } else if (typeof val === 'string') {
    //     return val.includes('\n') ? `\`${val}\`` : `'${val}'`
    } else {
        return String(val)
    }

}

export default function Inspector(props: any) {
    const [selectedItemId, setSelectedItemId] = useState<ElementId | null>(null)
    const [project, setProject] = useState<Project | null>(null)
    const [debugExpr, setDebugExpr] = useState<string | null>(null)
    const [debugData, setDebugData] = useState<DebugData>({})

    useEffect(()=> {
        const subscription = Editor.SelectedItemId().subscribe(setSelectedItemId)
        return () => subscription.unsubscribe()
    }, [])

    useEffect(()=> {
        const subscription = Editor.Project().subscribe(setProject)
        return () => subscription.unsubscribe()
    }, [])

    useEffect(()=> {
        const subscription = Preview.Debug(debugExpr).subscribe(setDebugData)
        return () => subscription.unsubscribe()
    }, [debugExpr])

    const element = (project && selectedItemId) ? project.findElement(selectedItemId) : null
    if (!element) {
        if (debugExpr !== null) setDebugExpr(null)
        return null
    }

    const propertyDefs = project!.propertyDefsOf(element)
    const {stateProperties} = element
    const dynamicPropertyDefs = propertyDefs.filter( prop => !isEventAction(prop) && isExpr((element as any)[prop.name]))
    const propertyDefEntries = dynamicPropertyDefs.map( prop => {
        const propVal = (element as any)[prop.name]
        const propertyExpr = propVal.expr
        const expr = propertyExpr.includes('$item') ? '"Not available"' : propertyExpr
        return `${prop.name}: ${expr}`
    })
    const statePropertyEntries = stateProperties.map( prop => `${prop}: ${element.codeName}.${prop}`)
    const elementDebugExpr = `({${[...propertyDefEntries, ...statePropertyEntries].join(', ')}})`
    if (debugExpr !== elementDebugExpr) setDebugExpr(elementDebugExpr)

    return <Box padding={2}>
        <Typography variant='h5' mb={1}>{element.name}</Typography>

        <Typography variant='h6' mb={1}>Properties</Typography>
        {dynamicPropertyDefs.map( prop => {
            const propExpr = (element as any)[prop.name]
            return <Stack direction='row' key={prop.name}>
                <Typography width='10em'>{prop.name}</Typography>
                <Typography width='20em'>{displayValue(debugData?.[prop.name])}</Typography>
                <Typography width='20em'>{isExpr(propExpr) ? propExpr.expr : propExpr}</Typography>
            </Stack>
        })}

        <Typography variant='h6' my={1}>State</Typography>
        {stateProperties.map( prop => {
            return <Stack direction='row' key={prop}>
                <Typography width='10em'>{prop}</Typography>
                <Typography width='20em'>{displayValue(debugData?.[prop])}</Typography>
            </Stack>
        })
        }
    </Box>
}
