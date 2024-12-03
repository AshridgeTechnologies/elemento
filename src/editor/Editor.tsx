import React, {useState} from 'react'

import Element from '../model/Element'
import AppStructureTree, {ModelTreeItem} from './AppStructureTree'
import PropertyEditor from './PropertyEditor'
import {ActionsAvailableFn, AppElementAction, OnActionFn, OnChangeFn, OnInsertWithSelectedFn, OnMoveFn, OnNameSelectedFn} from './Types'
import {ElementId, ElementType, InsertPosition} from '../model/Types'

import {Box, Grid2 as Grid, IconButton, InputAdornment, OutlinedInput} from '@mui/material'
import './splitPane.css'
import Project from '../model/Project'
import {AllErrors} from '../generator/Types'
import {PanelTitle} from './PanelTitle'
import {CancelOutlined, Search} from '@mui/icons-material'

const treeData = (project: Project, errors: AllErrors, search: RegExp | undefined): ModelTreeItem => {
    const searchResults = search ? project.searchElements(search) : []
    const treeNodeFromElement = (el: Element): ModelTreeItem => {
        const children = el.elements?.map(treeNodeFromElement)
        const hasErrors = !!errors[el.id]
        const isSearchResult = searchResults.includes(el)
        return new ModelTreeItem(el.id, el.name, el.kind, el.iconClass, hasErrors, isSearchResult, children)
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
    const [search, setSearch] = useState<string>('')

    const element = project.findElement(firstSelectedItemId)
    const onNameSelected: OnNameSelectedFn = (name: string) => {
        const elementToSelect = project.findClosestElementByCodeName(firstSelectedItemId, name)
        if (elementToSelect) {
            onSelectedItemsChange([elementToSelect.id])
        }
    }
    const onSearch = (search: string) => setSearch(search)
    const searchRegex = () => {
        if (!search) return undefined
        try {
            return new RegExp(search, 'gi')
        } catch (e: any) {
            return undefined
        }
    }
    const propertyArea = (firstSelectedItemId && element)
        ? <PropertyEditor element={element} propertyDefs={project.propertyDefsOf(element)}
                          onChange={onChange} onNameSelected={onNameSelected} onSearch={onSearch}
                          errors={errors[element.id]} search={searchRegex()}/>
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

    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value)
    }

    const clearSearch = () => {
        setSearch('')
    }

    const onSearchKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            clearSearch()
        }
    }

    const searchInput = <OutlinedInput
        sx={{backgroundColor: 'white', height: '1.8em', marginTop: '4px', marginRight: '6px', width: '16em', borderRadius: '5px', paddingLeft: '3px', paddingRight: '6px'}}
        value={search} onChange={onSearchChange} onKeyDown={onSearchKeydown}
        startAdornment={
            <InputAdornment position='start' sx={{marginRight: '4px'}}>
                <Search/>
            </InputAdornment>
        }
        endAdornment={
            <InputAdornment position='end' sx={{marginLeft: 0}}>
                <IconButton aria-label='clear search' onClick={clearSearch} edge="end">
                    <CancelOutlined/>
                </IconButton>
            </InputAdornment>
        }
    />

    /* Note on position attributes: Scrollable elements have position = 'relative' so EditorController can calculate pointer position */
    return <Grid container columns={10} spacing={0} height='100%'>
        <Grid size={4} id='navigationPanel' height='100%' overflow='scroll' position='relative'/* see comment above */>
            <PanelTitle name='Navigator'>
                {searchInput}
            </PanelTitle>
            <Box id='navigator' width='calc(100% - 16px)' height='calc(100% - 40px)' paddingLeft={1} paddingTop={1} overflow='scroll'
                 position='relative'>
                <AppStructureTree treeData={treeData(project, errors, searchRegex())}
                                  onSelect={onSelectedItemsChange}
                                  selectedItemIds={selectedItemIds}
                                  onAction={onTreeAction} onInsert={onContextMenuInsert}
                                  insertMenuItemFn={project.insertMenuItems.bind(project)}
                                  actionsAvailableFn={actionsAvailableFn}
                                  onMove={onMove}/>
            </Box>
        </Grid>
        <Grid size={6} height='100%' sx={{borderLeft: '1px solid lightgray'}} flexDirection='column' /* see comment above */>
            <PanelTitle name='Properties'/>
            <Box id='propertiesPanel' width='100%' height='calc(100% - 32px)' paddingLeft={1} paddingTop={1} overflow='scroll' position='relative'>
                {propertyArea}
            </Box>
        </Grid>
    </Grid>
}

export const editorMenuPositionProps = {
    root: {
        sx: {position: 'absolute'},
        slotProps: {
            backdrop: {
                sx: {
                    position: 'absolute',
                    backgroundColor: 'transparent'
                }}
        }
    }
}
