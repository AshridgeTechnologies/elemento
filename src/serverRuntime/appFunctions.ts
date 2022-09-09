import dataFunctions from '../runtime/dataFunctions'

const appFunctions = {...dataFunctions }

export const appFunctionsNames = () => {
    return Object.keys(appFunctions)
}

export default appFunctions