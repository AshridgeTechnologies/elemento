/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import TextInput from '../../src/runtime/TextInput'
import {snapshot} from '../util/testHelpers'

test('TextInput element produces output with properties supplied',
    snapshot(createElement(TextInput, {initialValue: 'Hi there!', maxLength: 10, label: 'Item Description'}))
)

test('TextInput element produces output with default values where properties omitted',
    snapshot(createElement(TextInput, {}))
)