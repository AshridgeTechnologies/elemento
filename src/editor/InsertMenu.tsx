import MenuItem from '@mui/material/MenuItem'
import lodash from 'lodash';
import Menu from '@mui/material/Menu'
import * as React from 'react'
import {PopoverOrigin} from '@mui/material'
import {ElementType} from '../model/Types'
import {editorElement, editorMenuPositionProps} from './Editor'

const {startCase} = lodash;

export function InsertMenu({anchorEl, anchorOrigin, open, items, onClose, onInsert, labelledBy}: {
    anchorEl: Element | null, labelledBy?: string, open: boolean,
    anchorOrigin: PopoverOrigin,
    items: ElementType[], onClose: () => void, onInsert: (elementType: ElementType) => void
}) {
    const menuItem = (elementType: ElementType) => {
        const onClick = () => onInsert(elementType.replace(/ /g, '') as ElementType)
        return <MenuItem onClick={onClick}>{startCase(elementType)}</MenuItem>
    }
    return <Menu
        id="insertMenu"
        data-testid="insertMenu"
        anchorEl={anchorEl}
        anchorOrigin={anchorOrigin}
        open={open}
        onClose={onClose}
        MenuListProps={labelledBy ? {'aria-labelledby': labelledBy} : {}}
        container={editorElement()}
        slotProps={editorMenuPositionProps}
    >
        {React.Children.toArray(items.map(menuItem))}
    </Menu>
}