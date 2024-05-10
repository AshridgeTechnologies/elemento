import React, {MouseEventHandler, SyntheticEvent} from 'react'
import {Box} from '@mui/material'
import {StylesProps, StylesPropVals, valueOf} from '../runtimeFunctions'
import {equals} from 'ramda'
import {sxProps} from './ComponentHelpers'

type Properties = {
    path: string,
    selected?: boolean,
    onClick?: MouseEventHandler<HTMLDivElement> | undefined,
    styles?: StylesPropVals,
    item: any,
    itemContentComponent: (props: { path: string, $item: any, $selected?: boolean }) => React.ReactElement | null,
}

const propsEqual = (prev: Properties, next: Properties) => {
    return prev.selected === next.selected && prev.item === next.item && prev.onClick === next.onClick && equals(prev.styles, next.styles)
}
const ItemSetItem = React.memo(
    function ItemSetItem({item, path, itemContentComponent, selected, onClick, styles: styleVals}: Properties) {
        const styles = valueOf(styleVals) ?? {}
        const content = React.createElement(itemContentComponent, {path, $item: item, $selected: selected})
        return React.createElement(Box, {id: path, onClick, sx: sxProps(styles)}, content)
    }, propsEqual)

export default ItemSetItem
