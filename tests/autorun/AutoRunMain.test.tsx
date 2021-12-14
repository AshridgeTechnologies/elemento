/**
 * @jest-environment jsdom
 */

import {actWait, treeItemLabels} from '../util/testHelpers'
import {render} from '@testing-library/react'
import React from 'react'
import AutoRunMain from '../../src/autorun/AutoRunMain'
import {editorAutorunFixture1} from '../util/autorunFixtures'

let container: any = null

const script = editorAutorunFixture1()

const itemLabels = () => treeItemLabels(container)

const renderComponent = () => actWait(() => ({container} = render(<AutoRunMain/>)))

test('renders autorun and updates script', async () => {
    await renderComponent()
    expect(itemLabels()).toStrictEqual(script.map( s => s.title ))
})