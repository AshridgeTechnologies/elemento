import React from 'react'
import {asArray, valueOfProps} from '../runtimeFunctions'
import List from '@mui/material/List'
import ListItem from './ListItem'
import {update, proxyUpdateFnType} from '../stateProxy'

type Properties = {
    items?: any[],
    itemContentComponent: (props: { path: string, $item: any }) => React.ReactElement | null,
    state: { selectedItem?: string, _path: string, _update: proxyUpdateFnType }
}

export default function ListElement({state, itemContentComponent, ...props}: Properties) {
    const {selectedItem = undefined, _path: path} = state
    const {items = []} = valueOfProps(props)
    const handleClick = (index: number) => state._update({selectedItem: items[index]})
    const children = asArray(items).map((item, index) => {
            const itemPath = `${path}.${index}`
            const selected = Boolean(item === selectedItem || (item.Id && item.Id === (selectedItem as any)?.Id) )
            const onClick = () => handleClick(index)
            return React.createElement(ListItem, {path: itemPath, selected, onClick, key: item.id ?? index},
                React.createElement(itemContentComponent, {path: itemPath, $item: item}))
        }
    )

    return React.createElement(List, {id: path}, children)
}

ListElement.State = class State {
    constructor(private props: { selectedItem: any }) {
    }

    get selectedItem() {
        return this.props.selectedItem
    }

    Reset() {
        return update({selectedItem: undefined})
    }
}