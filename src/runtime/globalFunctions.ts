export const globalFunctions = {
    Sum(...args: number[]) {
        return args.reduce( (acc, val) => acc + val, 0)
    },

    Log(...args: any[]) {
        console.log(...args)
    },

    If(condition: any, trueValue: any, falseValue?: any) {
        return !!condition ? trueValue : falseValue
    },

    Left(s: string, length: number) {
        return s.substring(0, length)
    },

    Mid(s: string, start: number, length?: number) {
        if (start < 1) throw new Error(`Function Mid parameter 2 (start) is ${start}. It should be greater than or equal to 1.`)
        if (length !== undefined && length < 0) throw new Error(`Function Mid parameter 3 (length) is ${length}. It should be greater than or equal to 0.`)
        return s.substring(start - 1, start - 1 + (length ?? s.length))
    },

    Right(s: string, length: number) {
        return s.substring(s.length - length)
    }
}