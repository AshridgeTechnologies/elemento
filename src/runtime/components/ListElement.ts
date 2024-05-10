import React, {ReactNode, SyntheticEvent, useEffect, useMemo, useRef} from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import List from '@mui/material/List'
import {useGetObjectState} from '../appData'
import {BaseComponentState, ComponentState} from './ComponentState'
import lodash from 'lodash';
import {sxProps} from './ComponentHelpers'

const {debounce} = lodash;

type Properties = Readonly<{
    path: string,
    show?: PropVal<boolean>,
    styles?: StylesPropVals,
    children: ReactNode
}>

type StateProperties = {scrollTop?: number}

const fixedSx = {overflow: 'scroll', maxHeight: '100%', py: 0}

const ListElement = React.memo( function ListElement({path, children, ...props}: Properties) {
    const state = useGetObjectState<ListElementState>(path)
    const {scrollTop} = state
    const scrollHandler = (event: SyntheticEvent) => {
        const {scrollTop} = (event.target as HTMLElement)
        state._setScrollTop(scrollTop)
    }

    const debouncedScrollHandler = useMemo(() => debounce(scrollHandler, 300), [])
    useEffect(() => () => debouncedScrollHandler.cancel(), []);

    const listRef = useRef<HTMLUListElement>(null)
    useEffect(() => listRef.current?.scroll?.(0, scrollTop), [scrollTop]) // scroll() not implemented in JSDOM

    const {show, styles = {}} = valueOfProps(props)
    const sx = {...fixedSx, ...sxProps(styles, show)}
    return React.createElement(List, {id: path, sx, onScroll: debouncedScrollHandler, ref: listRef}, children)
})

export default ListElement

export class ListElementState extends BaseComponentState<StateProperties>
    implements ComponentState<ListElementState>{

    get scrollTop() {
        return this.state.scrollTop ?? 0
    }

    _setScrollTop(scrollTop: number) {
        this.latest().updateState({scrollTop})
    }
}

(ListElement as any).State = ListElementState
