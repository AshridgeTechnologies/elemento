import dataFunctions from '../runtime/dataFunctions'

type UserDetails = Partial<{email: string, displayName: string, password: string}>

// const CreateUser = async (uid: string, details: UserDetails) => {
//     const {email, displayName, password} = details
//     await getAuth().createUser({uid, email, password, displayName,})
// }
// const UpdateUser = async (uid: string, details: UserDetails) => {
//     const {email, displayName, password} = details
//     const changes = {email, displayName, password}
//     await getAuth().updateUser(uid, changes)
// }
// const GetUser = (uid: string) => getAuth().getUser(uid)


const appFunctions = {...dataFunctions, /*CreateUser, GetUser, UpdateUser*/ }

export default appFunctions
