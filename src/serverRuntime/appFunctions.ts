import dataFunctions from '../runtime/dataFunctions'

const appFunctions = {...dataFunctions }

export const appFunctionsNames = () => {
    // CurrentUser is generated into the server app code
    return Object.keys(appFunctions).concat('CurrentUser')
}

export default appFunctions
