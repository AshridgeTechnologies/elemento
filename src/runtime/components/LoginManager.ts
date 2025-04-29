import {AuthManagerBase} from './AuthManager.js'

const locationPathname = ()=> location.origin + location.pathname

class LoginManager extends AuthManagerBase {

	async init() {
		const queryParams = new URLSearchParams(location.search.slice(1))
		const code = queryParams.get("code")
		const state = queryParams.get("state")

		if (code && state) {
			const challenge = JSON.parse(sessionStorage.getItem("challenge")!)
			if (code) {
				if (state === challenge.state && challenge.verifier) {
					const exchanged = await this.client.exchange(
						code!,
						locationPathname(),
						challenge.verifier,
					)
					if (!exchanged.err) {
						this.token = exchanged.tokens?.access
						localStorage.setItem("refresh", exchanged.tokens.refresh)
					}
				}
				window.location.replace(locationPathname())
			}
		}

		this.updateStatus()
	}

	async login() {
		const { challenge, url } = await this.client.authorize(locationPathname(), "code", {
			pkce: true,
		})
		sessionStorage.setItem("challenge", JSON.stringify(challenge))
		location.href = url
	}

	notifyLogin() {
		this.channel.postMessage('login')
	}
}

export default LoginManager


let popupWindow: Window | null = null

function openPopup(url: string) {
	const height = 700
	const width = 600
	const top = Math.round(window.innerHeight / 2 - height / 2)
	const left = Math.round(window.innerWidth / 2 - width / 2)
	const features = {
		popup: "yes",
		width,
		height,
		top,
		left,
		toolbar: "no",
		menubar: "no",
	};

	const strWindowsFeatures = Object.entries(features)
		.map(([key, value]) => `${key}=${value}`)
		.join(',')

	return window.open(url, "auth", strWindowsFeatures);
}

export const openLoginPopup = () => {
	if (popupWindow && !popupWindow?.closed) {
		popupWindow.focus()
	} else {
		popupWindow = openPopup('/auth')
	}
}
