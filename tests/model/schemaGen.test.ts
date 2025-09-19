import {test} from "vitest"

import {generateSchema} from '../../src/model/ModelElement'
import {Page, WebFileDataStore} from '../testutil/modelHelpers'

test('gen schema', () => {

    const elementClass = Page
    const schema = generateSchema(elementClass)

    const schemaNoDefs = {...schema, definitions: 'Definitions'}
    console.log(JSON.stringify(schemaNoDefs, null, 4))
})
