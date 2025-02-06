import React, {RefObject} from 'react'
import {PropVal, StylesProps, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {Box, Stack, SxProps} from '@mui/material'
import {sxProps} from './ComponentHelpers'
import {DragEndEvent, useDndMonitor, useDroppable} from '@dnd-kit/core'
import {BaseComponentState, ComponentState} from './ComponentState'
import {useObject} from '../appStateHooks'

const layoutChoices = ['vertical', 'horizontal', 'horizontal wrapped', 'positioned', 'none'] as const
export type BlockLayout = typeof layoutChoices[number]
export type RefType = ((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement> | null | undefined
type Properties = { path: string, layout: BlockLayout, dropAction?: () => void, show?: PropVal<boolean>, styles?: StylesPropVals,
    children?: React.ReactElement[] }
type BlockContentProperties = { path: string, layout: BlockLayout, show?: boolean, styles?: StylesProps,
    children?: React.ReactElement[], dragElementRef?: RefType }
type StateProperties = Partial<Readonly<{}>>

type StateUpdatableProperties = Partial<Readonly<{
    isOver: boolean
}
>>

export function BlockContent({path, layout, styles = {}, show, dragElementRef, children}: BlockContentProperties) {
    if (['horizontal', 'horizontal wrapped', 'vertical'].includes(layout)) {
        const horizontal: boolean = layout.startsWith('horizontal')
        const wrap = layout === 'horizontal wrapped'
        const direction = horizontal ? 'row' : 'column'
        const flexWrap = wrap ? 'wrap' : 'nowrap'

        const sx = {
            py: horizontal ? 0 : 1,
            overflow: horizontal ? 'visible' : 'scroll',
            maxHeight: '100%',
            boxSizing: 'border-box',
            alignItems: 'flex-start',
            padding: horizontal ? 0 : 1,
            ...sxProps(styles, show),
        } as SxProps

        return React.createElement(Stack, {
            id: path,
            ref: dragElementRef,
            direction,
            flexWrap,
            useFlexGap: true,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            spacing: 2,
            sx,
            children
        })
    }

    // use block layout
    const sx = {
        position: layout === 'positioned' ? 'relative' : 'inherit',
        width: '100%',  // so that absolutely positioned children are inside the block
        ...sxProps(styles, show)
    } as SxProps
    return React.createElement(Box, {
        id: path,
        ref: dragElementRef,
        sx,
        children
    })
}

export default function Block({children = [], path,  ...props}: Properties) {
    const {show, layout, styles = {}, dropAction} = valueOfProps(props)
    let setNodeRef: ((element: (HTMLElement | null)) => void) | undefined
    let isOver = false
    if (dropAction) {
        // ok - you should not call hooks inside a conditional block
        // BUT dropAction will always be defined or not defined for any given element
        ({isOver, setNodeRef} = useDroppable({id: path}))
        const state = useObject(path)
        state.setIsOver(isOver)

        useDndMonitor({
            onDragEnd(event: DragEndEvent) {
                const {item, itemId} = event.active.data.current ?? {}
                if (event.over?.id === path) {
                    dropAction?.(item, itemId)
                } else if (event.collisions?.some( coll => coll.id === path)) {
                    const itemCollision = event.collisions.find( coll => coll.id !== path && coll.data?.droppableContainer.data.current)
                    const {item: droppedOnItem, itemId: droppedOnItemId} = itemCollision?.data?.droppableContainer.data.current ?? {}
                    dropAction?.(item, itemId, droppedOnItem, droppedOnItemId)
                }
            }
        })
    }
    return React.createElement(BlockContent, {layout: layout, styles: styles, show: show, path: path, dragElementRef: setNodeRef, children: children})
}

export class BlockState extends BaseComponentState<StateProperties, StateUpdatableProperties>
    implements ComponentState<BlockState> {

    get isOver() {
        return this.state.isOver ?? false
    }

    setIsOver(isOver: boolean) {
        if (this.latest().isOver !== isOver) {
            this.latest().updateState({isOver})
        }
    }
}

(Block as any).State = BlockState
