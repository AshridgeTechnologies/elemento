import React, {ReactElement} from 'react'
import {Typography} from '@mui/material'

type Properties = {path: string, children?: any}

function asText(content: any): string | ReactElement {
    if (React.isValidElement(content)) return content
    if (typeof content === 'object' && 'value' in content) return content.value
    return content
}
export default function TextElement({children, path}: Properties) {
    return React.createElement(Typography, {id: path, gutterBottom: true}, asText(children))
}
