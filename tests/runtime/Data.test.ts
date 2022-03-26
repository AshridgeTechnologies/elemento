/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {Data} from '../../src/runtime/components'
import {snapshot} from '../testutil/testHelpers'
import {render} from '@testing-library/react'

test('Data element produces output with simple value',
    snapshot(createElement(Data, {state: {value: 'Hi there!', _path: 'app.page1.data1'}, display: true}))
)

test('Data element produces output with record value',
    snapshot(createElement(Data, {state: {value: {a: 10, b: 'Bee1', c: true}, _path: 'app.page1.data2'}, display: true}))
)

test('Data element produces empty output with default value for display', () => {
    const {container} = render(createElement(Data, {state: {value: 'Hi!', _path: 'app.page1.height'}}))
    expect(container.innerHTML).toBe('')
})
