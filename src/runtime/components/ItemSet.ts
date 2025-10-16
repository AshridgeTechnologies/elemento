import React, {Fragment, MouseEvent as SyntheticMouseEvent} from 'react'
import {asArray, indexedPath, lastItemIdOfPath, PropVal, StylesPropVals, valueOf, valueOfOneLevel} from '../runtimeFunctions'
import {BaseComponentState, ComponentState} from './ComponentState'
import {isNil, last, range, reverse, without} from 'ramda'
import {unique} from '../../util/helpers'
import {isNumeric} from 'validator'
import {use$state} from '../state/appStateHooks'
import {ElementMetadata, ElementSchema} from '../../model/ModelElement'
import {Definitions} from '../../model/schema'

const selectableChoices = ['none', 'single', 'multiple', 'multipleAuto'] as const
type Selectable = typeof selectableChoices[number]

type SelectionType = 'replace' | 'addRemove' | 'fromLast'

export type OnClickFn = (event: SyntheticMouseEvent<HTMLDivElement>, index: number) => void

type Properties = Readonly<{
    path: string,
    itemContentComponent: (props: { path: string, $item: any, $itemId: string, $index: number, $selected: boolean, onClick: OnClickFn }) => React.ReactElement | null,
    itemStyles?: StylesPropVals
}> & StateProperties

type StateProperties = Partial<Readonly<{
    items: PropVal<any[]>,
    selectable: PropVal<Selectable>,
    selectedItems: PropVal<any>,
    selectAction: ($items: any, $itemIds: any, $indexes: any) => void}
>>

type StateUpdatableProperties = Partial<Readonly<{
    selectedItemIds: (string|number)[]
}
>>

export const ItemSetSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "ItemSet",
    "description": "Shows a set of similar items.  The user can select one of the items, and the app can use the selected item to control something else.\n" +
        "A common use of this is to show a list of names of items on one side of a page, and show full details of the item selected in the other side.\n" +
        "The ItemSet needs a list of items to show.  This could be just a fixed list like [\"red\", \"green\", \"blue\"], but it is usually a Collection.\n" +
        "The elements contained by the ItemSet element determine what is shown for each item - they are repeated for each item.\n" +
        "The ItemSet needs to contain at least one other element in order to display anything, but you can display anything you want for each item.\n" +
        "In order for the elements within the ItemSet to get the data for the current item, they can use a special name $item in their formulas.",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "ItemSet",
    "icon": "list_alt",
    "elementType": "statefulUI",
    "canContain": 'elementsWithThisParentType',
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "items": {
                    "description": "The items that are shown",
                    "$ref": "#/definitions/Expression",
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
                "canDragItem": {
                    "description": "Whether items can be dragged",
                    "$ref": "#/definitions/BooleanOrExpression"
                },
                "itemStyles": {
                    "description": "The specific CSS styles applied to this element",
                    "$ref": "#/definitions/Styles"
                }
            }
        },
        "elements": {
            "type": "array",
            "items": {
                "$ref": "#/definitions/BaseElement"
            }
        }
    },
    "required": ["kind", "properties"],
    "unevaluatedProperties": false,

    "definitions": Definitions
}

export const ItemSetMetadata: ElementMetadata = {
    stateProps: ['items', 'selectedItems', 'selectable', 'selectAction']
}

const ItemSet = function ItemSet({path, itemContentComponent, items, selectable, selectedItems, selectAction}: Properties) {
    const state = use$state(path, ItemSetState, {items, selectable, selectedItems, selectAction})
    const onClick: OnClickFn = (event:SyntheticMouseEvent, index: number) => {
        const {shiftKey, ctrlKey, metaKey} = event
        if (shiftKey) {
            document.getSelection()?.empty()
        }
        const targetId = (event.target as HTMLElement).id
        const itemId = lastItemIdOfPath(targetId)
        if (itemId) {
            const selectionType: SelectionType = (metaKey || ctrlKey) ? 'addRemove' : shiftKey ? 'fromLast' : 'replace'
            state.onSelect(itemId, index, selectionType)
        }
    }

    const children = state.items.map((item, index) => {
            const itemId = item?.id ?? String(index)
            const itemPath = indexedPath(path, itemId)
            const selected = state.isSelected(index)
            return React.createElement(itemContentComponent, {path: itemPath, $item: item, $itemId: itemId, $index: index, $selected: selected, onClick, key: itemId})
        }
    )

    return React.createElement(Fragment, null, ...children)
}

export default ItemSet

export class ItemSetState extends BaseComponentState<StateProperties, StateUpdatableProperties>
    implements ComponentState{

    get items(): any[] {
        return valueOfOneLevel<any>(this.props.items) ?? []
    }

    get selectable() {
        return valueOf(this.props.selectable) ?? 'single'
    }

    get selectAction() {
        return this.props.selectAction
    }

    get selectedItems(): any[] {
        const selectedItems = this.state.selectedItemIds !== undefined ? this.state.selectedItemIds : this.props.selectedItems
        const uniqueSelectedItems = unique(asArray(valueOfOneLevel(selectedItems)))
        return uniqueSelectedItems.map( id => this.findItem(id) ).filter( it => it !== undefined)
    }

    get selectedItemIds(): (string | number)[] {
        return this.state.selectedItemIds ?? unique(asArray(valueOfOneLevel(this.props.selectedItems))).map( it => this.findId(it)).filter( it => it !== undefined)
    }

    get selectedItem() {
        return last(this.selectedItems) ?? null
    }

    _setSelectedItems(selectedItems: any) {
        const selectedItemIds = selectedItems ? asArray(valueOfOneLevel(selectedItems)).map( (it: any) => this.latest().findId(it)) : undefined
        this.updateState({selectedItemIds})
    }

    Reset() {
        this._setSelectedItems(undefined)
    }

    Set(selectedItems: any) {
        this._setSelectedItems(selectedItems)
    }

    Select(selectedItems: any) {
        this._setSelectedItems(this.latest().selectedItems.concat(valueOfOneLevel(selectedItems)))
    }

    isSelected(itemIndex: number) {
        const {selectedItemIds} = this
        const item = this.items[itemIndex]
        return selectedItemIds.includes(item?.id) || selectedItemIds.includes(itemIndex)
    }

    onSelect(selectedItemId: (string|number), index: number, type: SelectionType) {
        const selectActionSingle = () => {
            const newItemId = this.findId(selectedItemId)
            const newItem = this.findItem(newItemId)
            this.selectAction?.(newItem, newItemId, index)
        }

        if (this.selectable === 'none') {
            selectActionSingle()
        }
        if (this.selectable === 'single') {
            this._setSelectedItems(selectedItemId)
            selectActionSingle()
        }
        if (this.selectable === 'multiple' || this.selectable === 'multipleAuto') {
            if (type === 'addRemove' || this.selectable === 'multipleAuto') {
                const newItemId = this.findId(selectedItemId)
                const existingSelectedIds = this.selectedItemIds
                if (existingSelectedIds.includes(newItemId)) {
                    const newItemIds = without([newItemId], existingSelectedIds)
                    this._setSelectedItems(newItemIds)
                    this.selectAction?.(null, null, null)
                } else {
                    this._setSelectedItems(existingSelectedIds.concat(newItemId))
                    const newItemIds = [newItemId]
                    const newItems = newItemIds.map( it => this.findItem(it))
                    const newIndexes = newItems.map( it => this.findIndex(it))
                    this.selectAction?.(newItems, newItemIds, newIndexes)
                }
            } else if (type === 'fromLast') {
                const itemIndex = (id: typeof selectedItemId) => {
                    const index = this.items.findIndex( it => it?.id === id )
                    if (index !== -1) {
                        return index
                    }
                    const numberIndex = Number(id)
                    if (!isNaN(numberIndex)) {
                        return numberIndex
                    }
                    return null
                }

                const fromIndex = itemIndex(last(this.selectedItemIds) ?? 0)
                const toIndex = itemIndex(selectedItemId)
                if (fromIndex !== null && toIndex !== null) {
                    const selectedIndexes = (toIndex >= fromIndex) ? range(fromIndex, toIndex + 1) : reverse(range(toIndex, fromIndex + 1))
                    this._setSelectedItems(selectedIndexes)
                    const newItemIds = selectedIndexes.map( ind => this.findId(ind) )
                    const newItems = newItemIds.map( it => this.findItem(it))
                    const newIndexes = newItems.map( it => this.findIndex(it))
                    this.selectAction?.(newItems, newItemIds, newIndexes)
                }
            } else {
                this._setSelectedItems(selectedItemId)
                selectActionSingle()
            }
        }
    }

    private findItem(item: any) {
        if (typeof item === 'number' || typeof(item) === 'string' && isNumeric(item)) {
            return this.items[Number(item)]
        }
        return this.items.find( it => !isNil(it) && (it === item || it.id === item) ) ?? undefined
    }

    private findIndex(item: any) {
        return this.items.findIndex( it => !isNil(it) && (it === item || it.id === item) )
    }

    private findId(item: any) {
        const itemIndex = this.findIndex(item)
        if (itemIndex !== -1) {
            return this.items[itemIndex].id ?? itemIndex
        }

        const lookupItem = this.items[item]
        if (lookupItem !== undefined) {
            return lookupItem.id ?? Number(item)
        }

        return undefined
    }
}

(ItemSet as any).State = ItemSetState;
(ItemSet as any).Schema = ItemSetSchema;
(ItemSet as any).Metadata = ItemSetMetadata;
