import {modelElementClass} from '../../src/model/ModelElement'
import {default as AppBarRuntime} from '../../src/runtime/components/AppBar'
import {default as TextElementRuntime} from '../../src/runtime/components/TextElement'
import {default as TextInputRuntime} from '../../src/runtime/components/TextInput'
import {default as NumberInputRuntime} from '../../src/runtime/components/NumberInput'
import {default as BlockRuntime} from '../../src/runtime/components/Block'
import {default as ItemSetRuntime} from '../../src/runtime/components/ItemSet'
import {default as ButtonRuntime} from '../../src/runtime/components/Button'
import {default as MenuRuntime} from '../../src/runtime/components/Menu'
import {default as MenuItemRuntime} from '../../src/runtime/components/MenuItem'
import {elementOfType} from '../../src/model/elements'

export const AppBar = modelElementClass(AppBarRuntime)
export const TextInput = modelElementClass(TextInputRuntime)
export const NumberInput = elementOfType('NumberInput')
export const Text = modelElementClass(TextElementRuntime)
export const Block = modelElementClass(BlockRuntime)
export const ItemSet = modelElementClass(ItemSetRuntime)
export const Button = modelElementClass(ButtonRuntime)
export const Menu = modelElementClass(MenuRuntime)
export const MenuItem = modelElementClass(MenuItemRuntime)
export const Dialog = elementOfType('Dialog')
