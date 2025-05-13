import {afterEach, expect} from 'vitest'
import {cleanup} from "@testing-library/react"

import * as matchers from '@testing-library/jest-dom/matchers.js'
expect.extend(matchers)

afterEach(() => {
  cleanup()
})
