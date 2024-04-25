import React from 'react'

import Element from '../model/Element'
import AppStructureTree, {ModelTreeItem} from './AppStructureTree'
import PropertyEditor from './PropertyEditor'
import {ActionsAvailableFn, AppElementAction, OnActionFn, OnChangeFn, OnInsertWithSelectedFn, OnMoveFn, OnNameSelectedFn} from './Types'
import {ElementId, ElementType, InsertPosition} from '../model/Types'

import {Box, Grid, Typography} from '@mui/material'
import './splitPane.css'
import Project from '../model/Project'
import {AllErrors} from '../generator/Types'
import {PanelTitle} from './PanelTitle'

const treeData = (project: Project, errors: AllErrors): ModelTreeItem => {
    const treeNodeFromElement = (el: Element): ModelTreeItem => {
        const children = el.elements?.map(treeNodeFromElement)
        const hasErrors = !!errors[el.id]
        return new ModelTreeItem(el.id, el.name, el.kind, el.iconClass, hasErrors, children)
    }
    return treeNodeFromElement(project)
}

export default function Editor({
    project,
    onChange,
    onInsert,
    onMove,
    onAction,
    actionsAvailableFn,
    selectedItemIds,
    onSelectedItemsChange,
    errors
                               }: { project: Project, onChange: OnChangeFn, onInsert: OnInsertWithSelectedFn, onMove: OnMoveFn, onAction: OnActionFn,
                                    actionsAvailableFn: ActionsAvailableFn,
                                    selectedItemIds: string[], onSelectedItemsChange: (ids: string[]) => void,
                                    errors: AllErrors}) {
    const firstSelectedItemId = selectedItemIds[0]

    const element = project.findElement(firstSelectedItemId)
    const onNameSelected: OnNameSelectedFn = (name: string) => {
        console.log('onNameSelected', name)
        const elementToSelect = project.findClosestElementByCodeName(firstSelectedItemId, name)
        if (elementToSelect) {
            onSelectedItemsChange([elementToSelect.id])
        }
    }
    const propertyArea = (firstSelectedItemId && element)
        ? <PropertyEditor element={element} propertyDefs={project.propertyDefsOf(element)} onChange={onChange} onNameSelected={onNameSelected} errors={errors[element.id]}/>
        : null

    const onContextMenuInsert = (insertPosition: InsertPosition, targetElementId: ElementId, elementType: ElementType) => {
        const newElementId = onInsert(insertPosition, targetElementId, elementType)
        onSelectedItemsChange([newElementId])
    }

    const onTreeAction = async (ids: ElementId[], action: AppElementAction) => {
        const newSelectedItemId = await onAction(ids, action)
        if (newSelectedItemId) {
            onSelectedItemsChange([newSelectedItemId])
        }
    }

    /* Note on position attributes: Scrollable elements have position = 'relative' so EditorController can calculate pointer position */
    return <Grid container columns={10} spacing={0} height='100%'>
        <Grid item xs={4} id='navigationPanel' height='100%' overflow='scroll' position='relative'/* see comment above */>
            <PanelTitle name='Navigator'/>
            <Box id='navigator' width='100%' height='calc(100% - 32px)' paddingLeft={1} paddingTop={1} overflow='scroll' position='relative'>
                <AppStructureTree treeData={treeData(project, errors)} onSelect={onSelectedItemsChange}
                                  selectedItemIds={selectedItemIds}
                                  onAction={onTreeAction} onInsert={onContextMenuInsert}
                                  insertMenuItemFn={project.insertMenuItems.bind(project)}
                                  actionsAvailableFn={actionsAvailableFn}
                                  onMove={onMove}/>
            </Box>
        </Grid>
        <Grid item xs={6} height='100%' sx={{borderLeft: '1px solid lightgray'}} flexDirection='column' /* see comment above */>
            <PanelTitle name='Properties'/>
            <Box id='propertiesPanel' width='100%' height='calc(100% - 32px)' paddingLeft={1} paddingTop={1} overflow='scroll' position='relative'>
                {propertyArea}
            </Box>
        </Grid>
    </Grid>
}

export const editorMenuPositionProps = {
    root: {sx: {position: 'absolute'}},
    backdrop: {sx: {position: 'absolute'}},
}
