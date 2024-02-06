import React from 'react'
import {Button, Menu as Mui_Menu} from '@mui/material'
import {compose} from 'ramda'
import {PropVal, StylesProps, valueOfProps} from '../runtimeFunctions'

type Properties = Readonly<{
    path: string,
    label?: PropVal<string>,
    filled?: PropVal<boolean>,
    show?: PropVal<boolean>,
    styles?: StylesProps
    children?: any
}>

export default function Menu({path, children = [], ...props}: Properties) {
    const {label, filled, show = true, styles = {}} = valueOfProps(props)
    const showProps = show ? {} : {display: 'none'}

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    const buttonId = `${path}_button`
    const modifiedChildren = React.Children.toArray(children).map( (child: any, index) => {
        const {props} = child
        const existingAction = props.action
        const newAction = existingAction ? compose(existingAction, handleClose) : handleClose
        const key = props.key ?? props.label ?? index
        return React.cloneElement(child, {action: newAction, key})
    })
    return <div style={showProps}>
        <Button
            id={buttonId}
            variant={filled ? 'contained' : 'text'}
            size = 'small'
            disableElevation={true}
            aria-controls={open ? path : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
        >
            {label}
        </Button>
        <Mui_Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
                id: path,
                'aria-labelledby': buttonId,
                sx: styles
            }}
        >
            {modifiedChildren}
        </Mui_Menu>
    </div>
}
