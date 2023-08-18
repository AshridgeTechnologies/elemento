import MenuItem from '@mui/material/MenuItem'
import lodash from 'lodash';
import Menu from '@mui/material/Menu'
import * as React from 'react'
import {Divider, PopoverOrigin, Typography} from '@mui/material'
import {ElementId, ElementType, InsertPosition, InsertPositions} from '../model/Types'
import {editorMenuPositionProps} from './Editor'
import {editorElement} from './EditorElement'
import {useState} from 'react'
import {InsertMenuItemsFn, OnInsertFnWithPositionFn} from './Types'

const {startCase} = lodash;


const MenuSubTitle = (props: {children: React.ReactNode}) =>
    <Typography fontStyle='italic' fontSize='0.8em' color='#669' ml={1} mr={1}>{props.children}</Typography>

export function InsertMenu({anchorEl, anchorOrigin, transformOrigin, open, onClose, onInsert, insertMenuItems, targetItemId, labelledBy}: {
    anchorEl: Element | null,
    labelledBy?: string,
    open: boolean,
    anchorOrigin: PopoverOrigin,
    transformOrigin: PopoverOrigin,
    onClose: () => void,
    onInsert: OnInsertFnWithPositionFn
    insertMenuItems: InsertMenuItemsFn,
    targetItemId: ElementId
}) {
    const [insertPosition, setInsertPosition] = useState<InsertPosition>('after')

    const positionMenuItem = (position: InsertPosition) => {
        const onClick = () => setInsertPosition(position)
        return <MenuItem onClick={onClick} selected={position === insertPosition}>
            {startCase(position)}
        </MenuItem>
    }

    const menuItem = (elementType: ElementType) => {
        const onClick = () => onInsert(insertPosition, targetItemId, elementType.replace(/ /g, '') as ElementType)
        return <MenuItem onClick={onClick}>{startCase(elementType)}</MenuItem>
    }
    const labelledByProps = labelledBy ? {'aria-labelledby': labelledBy} : {}
    const items = insertMenuItems(insertPosition, targetItemId)
    const container = editorElement()
    const insertPositionsAvailable = InsertPositions.filter( position => insertMenuItems(position, targetItemId).length).map(positionMenuItem)
    return <Menu
        id="insertMenu"
        data-testid="insertMenu"
        anchorEl={anchorEl}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        open={open}
        onClose={onClose}
        MenuListProps={{dense: true, ...labelledByProps}}
        container={container}
        slotProps={editorMenuPositionProps}
        sx={{
            "& .MuiList-root": {  // Target the <ul>
                display: "flex",
                flexDirection: "row",
            },
        }}
    >
        <div style={{display: "flex", flexDirection: "column"}}>
            {React.Children.toArray(insertPositionsAvailable)}
            <MenuSubTitle>...the selected element</MenuSubTitle>
        </div>
        <div style={{display: "flex", flexDirection: "column", flexGrow: 0, borderLeft: "1px solid #aaa"}}/>
        <div data-testid='insertItems' style={{display: "flex", flexDirection: "column"}}>
            {React.Children.toArray(items.map(menuItem))}
    </div>


    </Menu>
}