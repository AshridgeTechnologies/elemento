import {test} from "vitest"

import {generateSchema} from '../../src/model/ModelElement'
import {SelectInput} from '../testutil/modelHelpers'

test('gen schema', () => {

    const elementClass = SelectInput
    const schema = generateSchema(elementClass)

    ;(schema as any).definitions = 'Definitions'

    const schemaJson = JSON.stringify(schema, null, 4)

    console.log(schemaJson)

})
