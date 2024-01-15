export const asCurrentUser = (user: {email: string, name: string, uid: string} | null) => {
   return user && {...user, Id: user.uid, Name: user.name, Email: user.email}
}

export function codeGenerationError(_expr: string, _err: string) {
   return undefined
}

