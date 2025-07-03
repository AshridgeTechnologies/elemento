import dataFunctions from '../runtime/dataFunctions'

export const componentNames = () => ['Collection', 'CloudflareDataStore', 'TinyBaseServerDataStore']
export const appFunctionsNames = () => {
    // CurrentUser is generated into the server app code
    const userFunctionNames = ['CreateUser', 'UpdateUser', 'GetUser']
    return Object.keys(dataFunctions).concat(userFunctionNames).concat('CurrentUser')
}
