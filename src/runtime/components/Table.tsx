import React, {MouseEvent as SyntheticMouseEvent} from 'react'
import {PropVal, StylesProps, StylesPropVals, valueOfProps} from '../runtimeFunctions'
import {useComponentState} from '../state/appStateHooks'
import {ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'
import {DecimalType, NumberType, RecordType, TrueFalseType} from '../types'
import {Box, Table as Mui_Table, TableBody, TableCell, TableContainer, TableHead, type TableProps, TableRow} from '@mui/material'
import {ContextProp, TableComponents, TableVirtuoso} from 'react-virtuoso'
import {sxProps} from './ComponentHelpers'
import BaseType from '../types/BaseType'
import {SelectableListState, type SelectableListStateProperties, type SelectionType, type OnClickFn} from './ItemSet'
import {isObject} from 'radash'
import {pickBy} from 'ramda'
import {omitBy} from 'lodash'

type Properties = Readonly<{
    path: string,
    dataType: RecordType,
    show?: PropVal<boolean>,
    styles?: StylesPropVals,
    rowStyles?: ($item: any, $index: number, $selected: boolean) => StylesProps
    cellStyles?: ($item: any, $index: number, $selected: boolean) => {[p: string]: StylesProps}
}> & StateProperties

type StateProperties = SelectableListStateProperties

const emptyObjectFn = () => ({})

export const TableSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Table",
    "description": "Shows a set of similar items in a table.  The user can select one of the item rows, and the app can use the selected item to control something else.\n" +
        "A common use of this is to show a table of items on one side of a page, and show full details of the item selected in the other side.\n" +
        "The Table needs a list of item records to show.  This is usually a Collection.\n" +
        "The columns of the Table are set by the dataType property - this must be a Record Type.",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "Table",
    "icon": "table_chart",
    "elementType": "statefulUI",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "items": {
                    "description": "The items that are shown in the table rows",
                    "$ref": "#/definitions/Expression",
                },
                "dataType": {
                    "description": "The Data Type of the items in this table.  Must be a Record Type.",
                    "$ref": "#/definitions/Expression"
                },
                "selectedItems": {
                    "description": "The item that is initially selected, until the user selects another",
                    "$ref": "#/definitions/Expression",
                },
                "selectable": {
                    "description": "Whether items in the list can be selected",
                    "enum": ['none', 'single', 'multiple', 'multipleAuto'],
                },
                "selectAction": {
                    "description": "The action formula that is run when an item is selected.\n" +
                        "The formula can use the special name <code>$item</code> for the item that has just been selected.\n",
                    "$ref": "#/definitions/ActionExpression",
                    "argNames": ['$item', '$itemId', '$index']
                },
                "show": {
                    "description": "Whether this element is displayed",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "styles": {
                    "description": "The specific CSS styles applied to this element",
                    "$ref": "#/definitions/Styles"
                },
                "rowStyles": {
                    "description": "The specific CSS styles applied to each row.\n" +
                        "The formula can use the special names <code>$item</code> for the item displayed in this row" +
                        " and <code>$index</code> for the zero-based index of this row",
                    "$ref": "#/definitions/CalculationExpression",
                    "argNames": ['$item', '$index', '$selected']
                },
                "cellStyles": {
                    "description": "The specific CSS styles applied to each cell in a row.\n" +
                        "The formula can use the special names <code>$item</code> for the item displayed in this row" +
                        " and <code>$index</code> for the zero-based index of this row",
                    "$ref": "#/definitions/CalculationExpression",
                    "argNames": ['$item', '$index', '$selected']
                }
            }
        },
    },
    "required": ["kind", "properties"],
    "unevaluatedProperties": false,

    "definitions": Definitions
}

const virtuosoTableComponents: TableComponents<any> = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
        <TableContainer component={Box} {...props} ref={ref} />
    )),
    Table: (props: TableProps & ContextProp<any>) => {
        const {tableSx} = props.context
        return (
            <Mui_Table {...props} sx={{borderCollapse: 'separate', tableLayout: 'auto', width: 'fit-content', ...tableSx}}/>
        )
    },
    TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableHead {...props} ref={ref} />
    )),
    TableRow: ({context, ...props}) => {
        const {item} = props
        const {isSelected, rowStyles} = (context as any)
        const index = props['data-item-index']
        const selected = isSelected(index)
        const sx = sxProps(rowStyles(item, index, selected))

        return (
            <TableRow {...props} sx={sx} selected={selected}  />
        )
    },
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableBody {...props} ref={ref} />
    ))
}

const containerStyleNamePrefixes = [
    'animation', 'border', 'box', 'clip', 'height', 'left', 'margin',
    'maxHeight', 'maxWidth', 'minHeight', 'minWidth', 'width', 'offset', 'outline',
    'padding', 'right', 'rotate', 'scale', 'top', 'translate', 'zIndex'
]

const Table = function Table(props: Properties) {
    const {path, items = [], dataType, selectable, selectAction,
        styles = {}, show, rowStyles = emptyObjectFn, cellStyles = emptyObjectFn} = valueOfProps(props) as any
    const selectedItems = isObject(props.selectedItems) ? props.selectedItems.valueOf() : props.selectedItems
    const state = useComponentState(path, TableState, {items, selectable, selectedItems, selectAction})
    const onClick: OnClickFn = (event:SyntheticMouseEvent, index: number) => {
        const {shiftKey, ctrlKey, metaKey} = event
        if (shiftKey) {
            document.getSelection()?.empty()
        }

        const itemId = items[index].id
        if (itemId) {
            const selectionType: SelectionType = (metaKey || ctrlKey) ? 'addRemove' : shiftKey ? 'fromLast' : 'replace'
            state.onSelect(itemId, index, selectionType)
        }
    }

    const columnTypes: BaseType<any, any>[] = dataType?.fields ?? []

    function fixedHeaderContent() {
        return (
            <TableRow>
                {columnTypes.map((column) => (
                    <TableCell
                        key={column.codeName}
                        variant="head"
                        align={'center'}
                        sx={{ backgroundColor: 'background.paper' }}
                    >
                        {column.name}
                    </TableCell>
                ))}
            </TableRow>
        )
    }

    function rowContent(index: number, item: object) {
        const selected = state.isSelected(index)
        const styles = cellStyles(item, index, selected) as {[p: string]: StylesProps}
        const allCellStyles = styles?._all ?? {}
        const stylesForCell = (name: string) => ({...allCellStyles, ...(styles?.[name] ?? {})})

        const columnAlign = (column: BaseType<any, any>) => {
            switch(column.constructor) {
                case NumberType:
                case DecimalType: return 'right'
                case TrueFalseType: return 'center'
                default: return 'left'
            }
        }

        return (
            <React.Fragment>
                {columnTypes.map((column) => (
                    <TableCell onClick={event => onClick(event, index)}
                               key={column.codeName}
                               sx={sxProps(stylesForCell(column.codeName))}
                               align={columnAlign(column)}
                    >
                        {item?.[column.codeName as keyof object]}
                    </TableCell>
                ))}
            </React.Fragment>
        )
    }

    const isContainerStyle = (_val: any, styleName: string) => {
        return containerStyleNamePrefixes.some(p => styleName.startsWith(p))
    }
    const containerStyles = pickBy(isContainerStyle, styles)
    const containerSx = sxProps(containerStyles as StylesProps, show as boolean | undefined)
    const tableStyles = omitBy(styles, isContainerStyle)
    const tableSx = sxProps(tableStyles as StylesProps)

    return (
        <Box id={path} sx={containerSx}>
            <TableVirtuoso
                data={items as object[]}
                components={virtuosoTableComponents}
                fixedHeaderContent={fixedHeaderContent}
                itemContent={rowContent}
                context={ {isSelected: state.isSelected, rowStyles, tableSx}}
            />
        </Box>
    )
}

export default Table

export class TableState extends SelectableListState {}

(Table as any).State = TableState;
(Table as any).Schema = TableSchema;
