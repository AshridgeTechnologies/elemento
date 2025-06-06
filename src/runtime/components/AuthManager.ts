// @ts-ignore
import {Client, createClient} from '@openauthjs/openauth/client'
import {subjects, User} from '../../shared/subjects'

export class AuthManagerBase {

	protected token: string | undefined
	protected listeners: (() => void)[] = []
	protected _loaded: boolean = false
	protected _loggedIn: boolean = false
    protected _client: Client | null = null
    protected _verifyClient: Client | null = null
    protected _user: User | undefined

	protected get client(): Client {
        return this._client ??= createClient({
            clientID: "elemento-app",
            issuer: this.origin + '/' + '_auth',
        })
    }
    // see https://github.com/toolbeam/openauth/issues/238

	protected get verifyClient(): Client {
        return this._verifyClient ??= createClient({
            clientID: "elemento-app",
            issuer: this.origin,
        })
    }

	protected channel: BroadcastChannel = new BroadcastChannel('elemento_auth')

    protected get origin() {
        return globalThis.location?.origin
    }

	get loaded() { return this._loaded }
	get loggedIn() { return this._loggedIn }
	get currentUser() { return this._user }

	onStatusChange(listener: () => void) {
		this.listeners = [...this.listeners, listener]
		return () => {
			this.listeners = this.listeners.filter( l => l !== listener )
		}
	}

	protected notifyStatusChange() {
		this.listeners.forEach(l => l())
	}

	protected async refreshTokens() {
		const refresh = globalThis.localStorage?.getItem("refresh")
		if (!refresh) return
		const next = await this.client.refresh(refresh, {
			access: this.token,
		})
		if (next.err) return
        if (next.tokens) {
            globalThis.localStorage.setItem("refresh", next.tokens.refresh)
            this.token = next.tokens.access
        }

        return this.token
    }

	get userId() {
		return this._user?.id
	}

	protected async updateStatus() {

		const token = await this.refreshTokens()

		if (token) {
			const verified = await this.verifyClient.verify(subjects, token);

			if (!verified.err) {
				this._user = verified.subject.properties
				this._loggedIn = true
			} else {
				console.error('Token not verified', verified.err)
			}
		}

		this._loaded = true
		this.notifyStatusChange()
	}
}

export class AuthManager extends AuthManagerBase {

	async init() {
		this.channel.onmessage = (event: MessageEvent) => {
			if (event.origin === this.origin) {
				if (event.data === 'login') {
					console.log('Logged in')
					this.updateStatus()
				}
				if (event.data === 'logout') {
					console.log('Logged out')
					this.updateForLogout()
				}
			}
		}

		await this.updateStatus()
	}

	logout() {
		localStorage.removeItem("refresh")
		this.updateForLogout()
		this.notifyLogout()
	}

	async getToken(): Promise<string | undefined> {
		return await this.refreshTokens()
	}

	private notifyLogout() {
		this.channel.postMessage('logout')
	}

	private updateForLogout() {
		this.token = undefined
		this._user = undefined
		this._loggedIn = false
		this.updateStatus()
	}
}
