import {object, string, InferInput} from 'valibot'
import { createSubjects } from "@openauthjs/openauth/subject"

export const subjects = createSubjects({
	user: object({
		id: string(),
		name: string(),
		email: string(),
	}),
})

export type User = InferInput<typeof subjects.user>
