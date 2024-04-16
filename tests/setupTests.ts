// @ts-ignore
jest.mock("nanoid", () => { return {
    customAlphabet : () => ()=> 'xyz1'
} })

import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;

// @ts-ignore
global.TextDecoder = TextDecoder;
