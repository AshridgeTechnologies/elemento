import React from 'react'
import Mui_ListItem from '@mui/material/ListItem'
import {valueOfProps} from '../runtimeFunctions'

type Properties = {path: string, children?: any }

export default function ListItem({children, path, ...props}: Properties) {
    const propVals = valueOfProps(props)
    return React.createElement(Mui_ListItem, {id: path, ...propVals}, children)
}
