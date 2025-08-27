import {modelElementClass} from '../../src/model/ModelElement'
import {default as TextElementRuntime} from '../../src/runtime/components/TextElement'
import {default as TextInputRuntime} from '../../src/runtime/components/TextInput'
import {default as BlockRuntime} from '../../src/runtime/components/Block'
import {default as ItemSetRuntime} from '../../src/runtime/components/ItemSet'

export const TextInput = modelElementClass(TextInputRuntime)
export const Text = modelElementClass(TextElementRuntime)
export const Block = modelElementClass(BlockRuntime)
export const ItemSet = modelElementClass(ItemSetRuntime)
