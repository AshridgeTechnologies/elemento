import React from 'react'
import {valueOfProps} from '../runtimeFunctions'
import List from '@mui/material/List'
type Properties = {path: string, children?: any }

export default function ListElement({children, path, ...props}: Properties) {
    const propVals = valueOfProps(props)
    return React.createElement(List, {id: path, ...propVals}, children)
}
