import { issuer } from "@openauthjs/openauth"
import { GithubProvider } from "@openauthjs/openauth/provider/github"
import { GoogleProvider } from "@openauthjs/openauth/provider/google"
import { PasswordProvider } from "@openauthjs/openauth/provider/password"
import { Select } from "@openauthjs/openauth/ui/select"
import { PasswordUI } from "@openauthjs/openauth/ui/password"
import { subjects } from '../shared/subjects'
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare"
import { Hono } from 'hono'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const AUTH_NAMESPACE = process.env.AUTH_NAMESPACE || 'auth'

let theIssuer

function createIssuer(env: any) {
    const providers =  {
        // github: GithubProvider({
        // 	clientID: process.env.GITHUB_CLIENT_ID!,
        // 	clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        // 	scopes: ["user:email"],
        // }),
        '_auth/google': GoogleProvider({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            scopes: ["email", "profile"]
        }),
        '_auth/password': PasswordProvider(
            PasswordUI({
                sendCode: async (email, code) => {
                    console.log(email, code)
                },
            }),
        )
    }

    const select = Select({
        providers: {
            '_auth/google': { display: "Google" },
            '_auth/password': { display: 'Password' }
        }
    })


    const storage = CloudflareStorage({
        namespace: env[AUTH_NAMESPACE]
    })

    const app = issuer({
        providers,
        storage,
        subjects,
        select,
        async success(ctx, value) {
            let userId = 'unknown', name = '', email = ''
            if (value.provider === "_auth/password") {
                userId = value.email
                email = value.email
            }
            if (value.provider === "_auth/google") {
                const userInfo = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${value.tokenset.access}`)
                    .then( resp => resp.json() )
                userId = userInfo.id
                email = userInfo.email
                name = userInfo.name
            }
            // if (value.provider === "github") {
            // 	console.log(value.tokenset.access)
            // 	userID = 'User1'
            // }

            return ctx.subject("user", {
                id: userId,
                email,
                name
            })
        }
    })

    return new Hono()
        .route('/_auth', app)
        .route('/', app)
}

function getIssuer(env: any) {
    return theIssuer ??= createIssuer(env)
}

export default getIssuer
