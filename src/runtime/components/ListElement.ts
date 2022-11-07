import React, {SyntheticEvent, useCallback} from 'react'
import {asArray, valueOfProps} from '../runtimeFunctions'
import List from '@mui/material/List'
import ListItem from './ListItem'
import {useGetObjectState} from '../appData'
import {BaseComponentState, ComponentState} from './ComponentState'

type Properties = {
    path: string,
    items?: any[],
    itemContentComponent: (props: { path: string, $item: any }) => React.ReactElement | null,
    width?: string | number,
    style?: string
}
type StateProperties = {selectedItem?: any}

const fixedSx = {overflow: 'scroll', maxHeight: '100%', py: 0}

const ListElement = React.memo( function ListElement({path, itemContentComponent, ...props}: Properties) {
    const state = useGetObjectState<ListElementState>(path)

    const {selectedItem = undefined} = state
    const {items = [], width, style} = valueOfProps(props)
    const onClick = useCallback((event:SyntheticEvent) => {
        const targetId = (event.target as HTMLElement).id
        const itemId = targetId.match(/\.#(\w+)/)?.[1]
        const selectedItem = items.find((it:any) => it.id === itemId)
        state._setSelectedItem(selectedItem)
    }, [items])
    const children = asArray(items).map((item, index) => {
            const itemId = item.id ?? index
            const itemPath = `${path}.#${itemId}`
            const selected = Boolean(item === selectedItem || (item.id && item.id === (selectedItem as any)?.id) )
            return React.createElement(ListItem, {path: itemPath, selected, onClick, item, itemContentComponent, key: itemId})
        }
    )

    return React.createElement(List, {id: path, sx: fixedSx, style}, children)
})

export default ListElement

export class ListElementState extends BaseComponentState<StateProperties>
    implements ComponentState<ListElementState>{

    get selectedItem() {
        return this.state.selectedItem !== undefined ? this.state.selectedItem : this.props.selectedItem
    }

    _setSelectedItem(selectedItem: any) {
        this.updateState({selectedItem})
    }

    Reset() {
        this._setSelectedItem(undefined)
    }

    Set(selectedItem: any) {
        this._setSelectedItem(selectedItem)
    }
}

(ListElement as any).State = ListElementState