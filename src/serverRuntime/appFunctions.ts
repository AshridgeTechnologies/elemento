import dataFunctions from '../runtime/dataFunctions'
import {User} from '../shared/subjects'

type UserDetails = Partial<{email: string, name: string, password: string}>

const CreateUser = async (uid: string, details: UserDetails) => {
    // const {email, name, password} = details
    // await getAuth().createUser({uid, email, password, name,})
}
const UpdateUser = async (uid: string, details: UserDetails) => {
    // const {email, name, password} = details
    // const changes = {email, displayName, password}
    // await getAuth().updateUser(uid, changes)
}
const GetUser = (uid: string): User => ({email: 'user@example.com', name: 'The User', id: 'The Id'})


const appFunctions = {...dataFunctions, CreateUser, GetUser, UpdateUser }

export default appFunctions
