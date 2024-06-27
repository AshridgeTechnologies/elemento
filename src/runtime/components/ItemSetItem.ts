import React, {MouseEventHandler, useContext} from 'react'
import {Box} from '@mui/material'
import {StylesPropVals, valueOf} from '../runtimeFunctions'
import {PageDndContext, sxProps} from './ComponentHelpers'
import {DragStartEvent, useDndMonitor, useDraggable, useDroppable} from '@dnd-kit/core'

type Properties = {
    path: string,
    item: any,
    itemId: string | number,
    onClick?: MouseEventHandler<HTMLDivElement> | undefined,
    canDragItem?: boolean,
    styles?: StylesPropVals,
    children: React.ReactNode
}

export default function ItemSetItem({path, item, itemId, onClick, canDragItem = false, styles: styleVals = {}, children}: Properties) {
    const styles = valueOf(styleVals) ?? {}

    const droppableProps = {id: path, data: {item, itemId} }
    const draggableProps = {...droppableProps, disabled: !canDragItem}
    const {attributes, listeners, setNodeRef: setDraggableNodeRef, transform} = useDraggable(draggableProps)
    const {setNodeRef: setDroppableNodeRef} = useDroppable(droppableProps)

    const setNodeRef = (el: HTMLElement | null) => {
        setDraggableNodeRef(el)
        setDroppableNodeRef(el)
    }

    const dndInfo = useContext(PageDndContext)
    useDndMonitor({
        onDragStart(event: DragStartEvent) {
            if (event.active.id === path) {
                const dragStyles = transform ? {transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, position: 'fixed', top: 0}: {}
                dndInfo!.current = React.createElement(Box, {id: path, sx: sxProps({...styles, ...dragStyles})}, children)
            }
        }
    })

    if (transform) {
        const stylesForDragPlaceholder = {...styles, opacity: 0.3}
        return React.createElement(Box, {id: path, ref: setNodeRef, sx: sxProps(stylesForDragPlaceholder), ...listeners, ...attributes}, children)
    }

    return React.createElement(Box, {id: path, ref: setNodeRef, onClick, sx: sxProps(styles), ...listeners, ...attributes}, children)
}
