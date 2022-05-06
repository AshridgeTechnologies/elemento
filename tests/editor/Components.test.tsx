/**
 * @jest-environment jsdom
 */

import React from 'react'
import AppBar from '../../src/shared/AppBar'
import MenuBar from '../../src/editor/MenuBar'
import InsertMenuWithButton from '../../src/editor/InsertMenuWithButton'
import {snapshotTest} from '../testutil/testHelpers'

describe('Components', () => {
    snapshotTest(<AppBar title='The title'/>)
    snapshotTest(<MenuBar/>)
    snapshotTest(<InsertMenuWithButton onInsert={() => {} } items={['Text', 'TextInput', 'NumberInput','SelectInput', 'TrueFalseInput', 'Button', 'Data', 'Page'] }/>)
})
