import React, {SyntheticEvent} from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import {valueOfProps} from '../runtimeFunctions'

type Properties = {path: string, selected: boolean, onClick: (event: SyntheticEvent) => void, item: any,
    itemContentComponent: (props: { path: string, $item: any }) => React.ReactElement | null,
    }

const propsEqual = (prev: Properties, next: Properties) => {
    return prev.selected === next.selected && prev.item === next.item
}
const ListItem = React.memo(
    function ListItem({item, path, itemContentComponent, ...props}: Properties) {
    const propVals = valueOfProps(props)
    const content = React.createElement(itemContentComponent, {path, $item: item})
    return React.createElement(ListItemButton, {id: path, divider: true, sx:{flexDirection: 'column', alignItems: 'flex-start' }, ...propVals}, content)
}, propsEqual )

export default ListItem
