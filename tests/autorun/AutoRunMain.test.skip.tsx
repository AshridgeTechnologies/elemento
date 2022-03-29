/**
 * @jest-environment jsdom
 */

import {render} from '@testing-library/react'
import React from 'react'
import AutoRunMain from '../../src/autorun/AutoRunMain'
import {editorAutorunFixture1} from '../testutil/autorunFixtures'
import {actWait} from '../testutil/rtlHelpers'
import {treeItemLabels} from '../testutil/testHelpers'

let container: any = null

const script = editorAutorunFixture1()

const itemLabels = () => treeItemLabels(container)

const renderComponent = () => actWait(() => ({container} = render(<AutoRunMain/>)))

test('renders autorun and updates script', async () => {
    await renderComponent()
    expect(itemLabels()).toStrictEqual(script.map( s => s.title ))
})