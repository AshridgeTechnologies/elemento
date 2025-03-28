import React, {Fragment, MouseEvent as SyntheticMouseEvent} from 'react'
import {asArray, indexedPath, lastItemIdOfPath, PropVal, StylesPropVals, valueOf, valueOfOneLevel} from '../runtimeFunctions'
import {BaseComponentState, ComponentState} from './ComponentState'
import {equals, isNil, last, omit, range, reverse, without} from 'ramda'
import {unique} from '../../util/helpers'
import {isNumeric} from 'validator'
import {shallow} from 'zustand/shallow'
import {useObject} from '../appStateHooks'

const selectableChoices = ['none', 'single', 'multiple', 'multipleAuto'] as const
type Selectable = typeof selectableChoices[number]

type SelectionType = 'replace' | 'addRemove' | 'fromLast'

export type OnClickFn = (event: SyntheticMouseEvent<HTMLDivElement>, index: number) => void

type Properties = Readonly<{
    path: string,
    itemContentComponent: (props: { path: string, $item: any, $itemId: string, $index: number, $selected: boolean, onClick: OnClickFn }) => React.ReactElement | null,
    itemStyles?: StylesPropVals
}>

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

const ItemSet = function ItemSet({path, itemContentComponent}: Properties) {
    const state: ItemSetState = useObject(path)
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
    implements ComponentState<ItemSetState>{

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

    protected isEqualTo(newObj: this): boolean {
        const otherProps = omit(['items'], this.props)
        const otherNewProps = omit(['items'], newObj.props)
        return equals(this.props.items, newObj.props.items) && shallow(otherProps, otherNewProps)
    }

    _setSelectedItems(selectedItems: any) {
        const selectedItemIds = selectedItems ? asArray(valueOfOneLevel(selectedItems)).map( (it: any) => this.latest().findId(it)) : undefined
        this.latest().updateState({selectedItemIds})
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

(ItemSet as any).State = ItemSetState
