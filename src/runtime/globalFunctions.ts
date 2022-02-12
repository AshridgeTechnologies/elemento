export const globalFunctions = {
    Sum(...args: number[]) {
        return args.reduce( (acc, val) => acc + val, 0)
    },

    Log(...args: any[]) {
        console.log(...args)
    }
}