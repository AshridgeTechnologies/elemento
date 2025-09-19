import {test} from "vitest"

import {generateSchema} from '../../src/model/ModelElement'
import {FunctionImport} from '../testutil/modelHelpers'

test('gen schema', () => {

    const elementClass = FunctionImport
    const schema = generateSchema(elementClass)

    const schemaNoDefs = {...schema, definitions: 'Definitions'}
    console.log(JSON.stringify(schemaNoDefs, null, 4))
})
