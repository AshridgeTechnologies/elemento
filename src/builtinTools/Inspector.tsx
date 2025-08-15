import {ElementId, PropertyDef, PropertyExpr, StylingProps} from '../model/Types'
import React, {ChangeEvent, ReactNode, useEffect, useState} from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Delete from '@mui/icons-material/Delete'
import HorizontalRule from '@mui/icons-material/HorizontalRule'
import PlayCircleOutline from '@mui/icons-material/PlayCircleOutline'
import SaveAlt from '@mui/icons-material/SaveAlt'
import {Editor} from '../editorToolApis/EditorControllerClient'
import Project from '../model/Project'
import {isEventAction, isExpr, notBlank} from '../util/helpers'
import {Preview} from '../shared/PreviewControllerClient'
import {pickBy} from 'ramda'
import {DebugData} from '../runtime/debug'
import Generator from '../generator/Generator'
import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'
import App from '../model/App'

const tooltipSlotProps = {
    popper: {
        modifiers: [
            {
                name: 'offset',
                options: {offset: [0, -14],},
            },
        ],
    },
}

const displayValue = (val: any): string | ReactNode => {
    if (val?._error) {
        return <Tooltip title={val._error} placement='bottom-start' slotProps={tooltipSlotProps}>
            <Typography color='darkred' fontSize='13px'>Error - {val._error}</Typography>
        </Tooltip>
    }
    const result = val?._isUpdate ? val.result : val
    return <JsonView src={result} enableClipboard={false} collapsed={2} theme="default"/>
}

const watchName = (index: number) => `Watch ${index + 1}`
const indexFromWatchName = (name: string) => parseInt(name.split(/ /)[1]) - 1

export default function Inspector(_props: any) {
    const [selectedItemId, setSelectedItemId] = useState<ElementId | null>(null)
    const [project, setProject] = useState<Project | null>(null)
    const [generator, setGenerator] = useState<Generator | null>(null)
    const [debugExpr, setDebugExpr] = useState<string | null>(null)
    const [debugData, setDebugData] = useState<DebugData>({})
    const [currentWatch, setCurrentWatch] = useState<string | null>(null)
    const [watchExprs, setWatchExprs] = useState<string[]>([])
    const [updatesInProgress, setUpdatesInProgress] = useState<string[]>([])

    const projectUpdated = (project: Project) => {
        const app = project.findChildElements('App')[0] as App
        setGenerator(new Generator(app, project))
        setProject(project)
    }

    useEffect(()=> {
        const subscription = Editor.SelectedItemId().subscribe(setSelectedItemId)
        const selectionSubscription = Editor.SelectedText().subscribe(text => {
            if (text) setCurrentWatch(text)
        })
        return () => {
            subscription.unsubscribe()
            selectionSubscription.unsubscribe()
        }
    }, [])

    useEffect(()=> {
        const subscription = Editor.Project().subscribe(projectUpdated)
        return () => subscription.unsubscribe()
    }, [])

    useEffect(()=> {
        const onUpdate = (data: DebugData) => {
            setDebugData(data)
            if (updatesInProgress.length > 0) {
                setUpdatesInProgress([])
            }
        }
        const subscription = Preview.Debug(debugExpr).subscribe(onUpdate)
        return () => subscription.unsubscribe()
    }, [debugExpr, updatesInProgress])

    const element = (project && selectedItemId) ? project.findElement(selectedItemId) : null
    if (!element) {
        if (debugExpr !== null) setDebugExpr(null)
        return <Typography variant='h6'>Select an Element in the Navigator to see its details</Typography>
    }

    const propertyDefs = project!.propertyDefsOf(element)
    const {stateProperties} = element
    const isExcluded = (prop: PropertyDef) => element.kind === 'Function' && prop.name === 'calculation'
    const currentPageEntry = ['Current Page', 'CurrentUrl().page']
    const stateEntry = ['_state', '_state']
    const selectedEntry = currentWatch ? [['Current Watch', currentWatch]] : []
    const dynamicPropertyDefs = propertyDefs.filter( prop => !isEventAction(prop) && !isExcluded(prop) && isExpr((element as any)[prop.name]))
    const propertyDefEntries = dynamicPropertyDefs.map( prop => {
        const propVal = (element as any)[prop.name]
        const propertyExpr = propVal.expr
        const expr = propertyExpr.includes('$item') ? '"Not available"' : propertyExpr
        return [prop.name, expr]
    })
    const styles: StylingProps = (element as any).styles ?? {}
    const dynamicStyles = pickBy((value) => isExpr(value), styles) as StylingProps
    const dynamicStyleEntries = Object.entries(dynamicStyles).map( ([name, expr]) => [`styles.${name}`, (expr as PropertyExpr).expr])
    const statePropertyEntries = stateProperties.map( prop => [prop, `_selectedElement.${prop}`])
    const watchEntries = watchExprs.map( (expr, index) => [watchName(index), expr]).filter(([_name, expr]) => notBlank(expr))
    const allEntries = [currentPageEntry, stateEntry, ...selectedEntry, ...propertyDefEntries, ...dynamicStyleEntries, ...statePropertyEntries, ...watchEntries]
    const elementDebugExprs = Object.fromEntries(allEntries)
    const containerToEvaluateExprs = () => {
        const currentPageName = debugData?.['Current Page']
        if (currentPageName) {
            return project!.findElementsBy( el => el.kind === 'Page' && el.codeName === currentPageName)[0] as any
        }
        const pageOfElement = project!.findElementsBy(el => el.kind === 'Page' && el.findElement(element.id) !== null)[0] as any
        if (pageOfElement) return pageOfElement

        return project!.findChildElements('App')[0] as App
    }
    const [latestDebugExpr = null, errors = {}] = generator?.generateStandaloneBlock(element, elementDebugExprs, containerToEvaluateExprs(), updatesInProgress) ?? []
    if (latestDebugExpr !== debugExpr) setDebugExpr(latestDebugExpr)

    const updateWatchExpr = (event: ChangeEvent) => {
        const name = (event.target as HTMLInputElement).name
        const index = indexFromWatchName(name)
        const newExpr = (event.target as HTMLInputElement).value
        const newExprs = [...watchExprs]
        newExprs[index] = newExpr
        setWatchExprs(newExprs)
    }

    const updateCurrentWatch = (event: ChangeEvent) => {
        const newExpr = (event.target as HTMLInputElement).value
        setCurrentWatch(newExpr || null)
    }

    const deleteWatchExpr = (index: number) => {
        const newExprs = [...watchExprs]
        newExprs.splice(index, 1)
        setWatchExprs(newExprs)
    }

    const addWatchExpr = (expr: string) => setWatchExprs([expr, ...watchExprs])

    const runExpr = (name: string) => setUpdatesInProgress([name])

    const displayCurrentWatch = () => {
        const actionButton = <IconButton aria-label="save" title="Save" onClick={() => addWatchExpr(currentWatch!)} disabled={!currentWatch}>
            <SaveAlt />
        </IconButton>
        return watchRow(currentWatch ?? '', 'Current Watch', updateCurrentWatch, actionButton)
    }

    const displayWatch = (expr: string, index: number) => {
        const actionButton = <IconButton aria-label="delete" title="Delete" onClick={() => deleteWatchExpr(index)}>
            <Delete/>
        </IconButton>
        return watchRow(expr, watchName(index), updateWatchExpr, actionButton)
    }

    const watchRow = (expr: string, exprName: string, updateFn: (event: ChangeEvent) => void, actionButton: ReactNode) => {
        const data = debugData?.[exprName]
        const updateInProgress = updatesInProgress.includes(exprName)
        return <Stack direction='row' gap={1} mb={1} key={exprName}>
            <TextField sx={{width: '20em'}} size='small' label={exprName} value={expr ?? ''} name={exprName} onChange={updateFn}
                       error={!!errors[exprName]} helperText={errors[exprName]}/>
            {actionButton}
            {data?._isUpdate ? <IconButton aria-label="run" title="Run/Update" onClick={() => runExpr(exprName)} disabled={updateInProgress}>
                    <PlayCircleOutline/>
                </IconButton>
                : <IconButton><HorizontalRule htmlColor={'transparent'}/></IconButton>}
            {displayValue(data)}
        </Stack>
    }

    return <Box padding={2}>
        <Typography variant='h5' mb={1}>{element.name}</Typography>

        <Typography variant='h6' mb={1}>Properties</Typography>
        {dynamicPropertyDefs.map( prop => {
            const propExpr = (element as any)[prop.name]
            return <Stack direction='row' gap={2} key={prop.name}>
                <Tooltip title={isExpr(propExpr) ? propExpr.expr : propExpr} placement='bottom-start' slotProps={tooltipSlotProps}><Typography width='10em'>{prop.name}</Typography></Tooltip>
                {displayValue(debugData?.[prop.name])}
            </Stack>
        })}

        <Typography variant='h6' my={1}>Styles</Typography>
        {Object.keys(dynamicStyles).map( prop => {
            const propExpr = dynamicStyles[prop as keyof StylingProps] as PropertyExpr
            return <Stack direction='row' gap={2} key={`styles.${prop}`}>
                <Tooltip title={isExpr(propExpr) ? propExpr.expr : propExpr} placement='bottom-start' slotProps={tooltipSlotProps}><Typography width='10em'>{prop}</Typography></Tooltip>
                {displayValue(debugData?.[`styles.${prop}`])}
            </Stack>
        })}

        <Typography variant='h6' my={1}>State</Typography>
        {stateProperties.map( prop => {
            return <Stack direction='row' gap={2} key={prop}>
                <Typography width='10em'>{prop}</Typography>
                {displayValue(debugData?.[prop])}
            </Stack>
        })
        }

        <Typography variant='h6' my={1}>Watch</Typography>
        {displayCurrentWatch()}
        {watchExprs.map(displayWatch)}

        <Stack direction='row' gap={2} key={'Current Page'}>
            <Typography width='10em'>Current Page</Typography>
            {displayValue(debugData?.['Current Page'])}
        </Stack>
    </Box>
}
