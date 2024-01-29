import dataFunctions from '../runtime/dataFunctions'

export const componentNames = () => ['FirestoreDataStore', 'Collection']
export const appFunctionsNames = () => {
    // CurrentUser is generated into the server app code
    // Cannot import user functions names as it pulls firebase-admin into client build
    const userFunctionNames = ['CreateUser', 'UpdateUser', 'GetUser']
    return Object.keys(dataFunctions).concat(userFunctionNames).concat('CurrentUser')
}
