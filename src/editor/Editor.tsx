import React from 'react'

import Element from '../model/Element'
import AppStructureTree, {ModelTreeItem} from './AppStructureTree'
import PropertyEditor from './PropertyEditor'
import {ActionsAvailableFn, AppElementAction, OnActionFn, OnChangeFn, OnInsertWithSelectedFn, OnMoveFn} from './Types'
import {ElementId, ElementType, InsertPosition} from '../model/Types'
import {elementTypes} from '../model/elements'

import {Box, Grid} from '@mui/material'
import './splitPane.css'
import Project from '../model/Project'
import {AllErrors} from '../generator/Types'

const treeData = (project: Project, errors: AllErrors): ModelTreeItem => {
    const treeNodeFromElement = (el: Element): ModelTreeItem => {
        const children = el.elements?.map(treeNodeFromElement)
        const hasErrors = !!errors[el.id]
        return new ModelTreeItem(el.id, el.name, el.kind, hasErrors, children)
    }
    return treeNodeFromElement(project)
}

const allElementTypes = Object.keys(elementTypes()) as ElementType[]

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
    const propertyArea = (firstSelectedItemId && element)
        ? <PropertyEditor project={project} element={element} onChange={onChange} errors={errors[element.id]}/>
        : null

    const insertMenuItems = (insertPosition: InsertPosition, targetItemId: ElementId): ElementType[] => {
        return allElementTypes.filter(type => project.canInsert(insertPosition, targetItemId, type))
    }

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
                    <AppStructureTree treeData={treeData(project, errors)} onSelect={onSelectedItemsChange}
                                      selectedItemIds={selectedItemIds}
                                      onAction={onTreeAction} onInsert={onContextMenuInsert}
                                      insertMenuItemFn={insertMenuItems}
                                      actionsAvailableFn={actionsAvailableFn}
                                      onMove={onMove}/>
                </Grid>
                <Grid item xs={6} height='100%' overflow='scroll' sx={{borderLeft: '1px solid lightgray'}} position='relative'/* see comment above */>
                    <Box id='propertyPanel' width='100%' paddingLeft={1}>
                        {propertyArea}
                    </Box>
                </Grid>
            </Grid>
}

export const editorMenuPositionProps = {
    root: {sx: {position: 'absolute'}},
    backdrop: {sx: {position: 'absolute'}},
}
