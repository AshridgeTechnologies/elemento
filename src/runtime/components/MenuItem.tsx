import React from 'react'
import {MenuItem as Mui_MenuItem} from '@mui/material'

type Properties = { path: string, label: string, action?: () => void, display?: boolean  }

export default function MenuItem({path, label, action, display = true}: Properties) {
    return !display ? null : <Mui_MenuItem id={path} onClick={action}>{label}</Mui_MenuItem>
}

