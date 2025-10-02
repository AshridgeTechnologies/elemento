import React, {ReactNode, SyntheticEvent, useEffect, useMemo, useRef} from 'react'
import {PropVal, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import List from '@mui/material/List'
import {BaseComponentState} from '../state/BaseComponentState'
import lodash from 'lodash'
import {sxProps} from './ComponentHelpers'
import {useComponentState} from '../state/appStateHooks'
import {ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

const {debounce} = lodash

type Properties = Readonly<{
    path: string,
    show?: PropVal<boolean>,
    styles?: StylesPropVals,
    children: ReactNode
}>

type StateProperties = {scrollTop?: number}

const fixedSx = {overflow: 'scroll', maxHeight: '100%', py: 0, flexShrink: 0}

export const ListElementSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "List",
    "description": "Description of List",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "List",
    "icon": "list",
    "elementType": "statefulUI",
    "isLayoutOnly": true,
    "canContain": "elementsWithThisParentType",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "show": {
                    "description": "The ",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "styles": {
                    "description": "The ",
                    "$ref": "#/definitions/Styles"
                }
            }
        },
        "elements": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/BaseElement"
            }
        }
    },
    "required": [
        "kind",
        "properties"
    ],
    "unevaluatedProperties": false,
    "definitions": Definitions
}

const ListElement = React.memo( function ListElement({path, children, ...props}: Properties) {
    const state = useComponentState(path, ListElementState)
    const {scrollTop} = state
    const scrollHandler = (event: SyntheticEvent) => {
        const {scrollTop} = (event.target as HTMLElement)
        state._setScrollTop(scrollTop)
    }

    const debouncedScrollHandler = useMemo(() => debounce(scrollHandler, 300), [])
    useEffect(() => () => debouncedScrollHandler.cancel(), [])

    const listRef = useRef<HTMLUListElement>(null)
    useEffect(() => listRef.current?.scroll?.(0, scrollTop), [scrollTop]) // scroll() not implemented in JSDOM

    const {show, styles = {}} = valueOfProps(props)
    const sx = {...fixedSx, ...sxProps(styles, show)}
    return React.createElement(List, {id: path, sx, onScroll: debouncedScrollHandler, ref: listRef}, children)
})

export class ListElementState extends BaseComponentState<StateProperties> {

    get scrollTop() {
        return this.state.scrollTop ?? 0
    }

    _setScrollTop(scrollTop: number) {
        this.updateState({scrollTop})
    }
}

;(ListElement as any).State = ListElementState
;(ListElement as any).Schema = ListElementSchema

export default ListElement

