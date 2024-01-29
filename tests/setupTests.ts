// @ts-ignore
jest.mock("nanoid", () => { return {
    customAlphabet : () => ()=> 'xyz1'
} })
