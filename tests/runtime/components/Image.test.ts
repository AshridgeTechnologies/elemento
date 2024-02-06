/**
 * @jest-environment jsdom
 */

import {createElement} from 'react'
import {Image} from '../../../src/runtime/components/index'
import {componentJSON, snapshot, valueObj, wait} from '../../testutil/testHelpers'
import {AppUtilsContext} from '../../../src/runner/AppRunner'
import AppUtils from '../../../src/runtime/AppUtils'

const inAppUtilsProvider = (prefix: string | undefined, el: any) => {
    const appUtils = new AppUtils(prefix)
    return createElement(AppUtilsContext.Provider, {value: appUtils}, el)
}

test('Image element produces image output with default properties',
    snapshot(inAppUtilsProvider(undefined, createElement(Image, {path: 'app.page1.photo', source: 'star.jpg', })))
)

test('Image element not visible with display false',
    snapshot(inAppUtilsProvider('http://example.com/anApp/somewhere', createElement(Image, {path: 'app.page1.photo', source: 'star.jpg', show: false})))
)

test('Image element produces output with properties supplied as state values', async () => {
        const element = inAppUtilsProvider('http://example.com/anApp/somewhere',
            createElement(Image, {path: 'app.page1.photo', source: valueObj('star.jpg'), description: 'A big mountain', show: valueObj(true),
                                                            styles: {width: 200, height: 100, marginBottom:'1em'} }))
        await wait(10)
        expect(componentJSON(element)).toMatchSnapshot()
    }
)


