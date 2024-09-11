/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {Frame} from '../../../src/runtime/components/index'
import {componentJSON, inAppContextProvider, snapshot, valueObj, wait} from '../../testutil/testHelpers'

test('Frame element produces frame output with default properties',
    snapshot(inAppContextProvider(undefined, createElement(Frame, {path: 'app.page1.photo', source: 'sidebar.pdf', })))
)

test('Frame element not visible with display false',
    snapshot(inAppContextProvider('http://example.com/anApp/somewhere', createElement(Frame, {path: 'app.page1.photo', source: 'sidebar.pdf', show: false})))
)

test('Frame element produces output with properties supplied as state values', async () => {
        const element = inAppContextProvider('http://example.com/anApp/somewhere',
            createElement(Frame, {path: 'app.page1.photo', source: valueObj('sidebar.pdf'), show: valueObj(true),
                                                            styles: {width: 200, height: 100, marginBottom:'1em'} }))
        await wait(10)
        expect(componentJSON(element)).toMatchSnapshot()
    }
)


