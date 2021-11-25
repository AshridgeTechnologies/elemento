import {createElement} from 'react'
import TextElement from '../../src/runtime/TextElement'
import {snapshot} from '../util/testHelpers'

test('TextElement element produces output containing children',
    snapshot(createElement(TextElement, null, 'Hello', 'where are you'))
)