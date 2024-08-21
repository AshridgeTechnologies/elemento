import React, {MouseEventHandler, MouseEvent, useContext} from 'react'
import {Box} from '@mui/material'
import {StylesPropVals, valueOf} from '../runtimeFunctions'
import {PageDndContext, sxProps} from './ComponentHelpers'
import {DragStartEvent, useDndMonitor, useDraggable, useDroppable} from '@dnd-kit/core'
import {OnClickFn} from './ItemSet'

type Properties = {
    path: string,
    item: any,
    itemId: string,
    index: number,
    onClick?: OnClickFn | undefined,
    canDragItem?: boolean,
    styles?: StylesPropVals,
    children: React.ReactNode
}

export default function ItemSetItem({path, item, itemId, index, onClick, canDragItem = false, styles: styleVals = {}, children}: Properties) {
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
                const dragPlaceholderStyles = {width: '100%', height: '100%',} // ensure placeholder fills the drag item container
                dndInfo!.current = React.createElement(Box, {id: path+ '_drag', sx: sxProps({...styles,  ...dragPlaceholderStyles, ...dragStyles})}, children)
            }
        }
    })

    if (transform) {
        const stylesForDragPlaceholder = {...styles, opacity: 0.3}
        return React.createElement(Box, {id: path, ref: setNodeRef, sx: sxProps(stylesForDragPlaceholder), ...listeners, ...attributes}, children)
    }

    const onClickWithIndex: MouseEventHandler<HTMLDivElement> = (event: MouseEvent<HTMLDivElement>) => onClick?.(event, index)
    const draggableStyles: any = canDragItem ? {touchAction: 'none'} : {}
    return React.createElement(Box, {id: path, ref: setNodeRef, onClick: onClickWithIndex, sx: sxProps({...styles, ...draggableStyles}), ...listeners, ...attributes}, children)
}
