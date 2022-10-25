export const asCurrentUser = (user: {email: string, name: string}) => {
   return user && {...user, Name: user.name, Email: user.email}
}

export function codeGenerationError(_expr: string, _err: string) {
   return undefined
}

