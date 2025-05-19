import {afterEach, expect, vi} from 'vitest'
import {cleanup} from "@testing-library/react"
import { TextEncoder, TextDecoder } from "util"

import * as matchers from '@testing-library/jest-dom/matchers.js'
expect.extend(matchers)

afterEach(() => {
  cleanup()
})

// @ts-ignore
vi.mock("nanoid", () => { return {
  customAlphabet : () => ()=> 'xyz1'
} })

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}

if (!global.TextEncoder) {
  global.TextEncoder = class extends TextEncoder {
    encode(text) {
      return new Uint8Array(super.encode(text));
    }
  };
}
