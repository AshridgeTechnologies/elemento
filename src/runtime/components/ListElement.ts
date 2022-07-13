import React from 'react'
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

export default function ListElement({path, itemContentComponent, ...props}: Properties) {
    const state = useGetObjectState<ListElementState>(path)

    const {selectedItem = undefined} = state
    const {items = [], width, style} = valueOfProps(props)
    const handleClick = (index: number) => state._setSelectedItem(items[index])
    const children = asArray(items).map((item, index) => {
            const itemId = item.id ?? item.Id ?? index
            const itemPath = `${path}.#${itemId}`
            const selected = Boolean(item === selectedItem || (item.Id && item.Id === (selectedItem as any)?.Id) )
            const onClick = () => handleClick(index)
            return React.createElement(ListItem, {path: itemPath, selected, onClick, key: itemId},
                React.createElement(itemContentComponent, {path: itemPath, $item: item}))
        }
    )

    return React.createElement(List, {id: path, sx:{width, overflow: 'scroll', maxHeight: '100%', py: 0}, style}, children)
}

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

ListElement.State = ListElementState