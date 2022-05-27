import React from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import {valueOfProps} from '../runtimeFunctions'

type Properties = {path: string, selected: boolean, onClick: () => void, children?: any }

export default function ListItem({children, path, ...props}: Properties) {
    const propVals = valueOfProps(props)
    return React.createElement(ListItemButton, {id: path, divider: true, sx:{flexDirection: 'column', alignItems: 'flex-start' }, ...propVals}, children)
}
