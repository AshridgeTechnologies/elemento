import React, {useEffect, useRef, useState} from "react"
import LoginManager from './LoginManager.js'

function Login() {
	const authRef = useRef<LoginManager>(new LoginManager())
	const [, setUpdate] = useState(0)
	const auth = authRef.current

    const params = new URLSearchParams(location.search)
    if (params.get('error')) {
        return <div>
            <h2>Login error</h2>
            <div>{params.get('error_description')}</div>
            <button onClick={() => window.location.replace('/')}>Continue</button>
        </div>
    }

    useEffect(() => {
        auth.onStatusChange(() => {
            setUpdate(x => x + 1)
        })
        auth.init()
    }, [])

    if (auth.loaded) {
		if (auth.loggedIn) {
			if (window.opener) {
				auth.notifyLogin()
				window.close()
			} else {
				return <div>
					<h2>Logged in</h2>
					<button onClick={() => window.location.replace('/')}>Continue</button>
				</div>
			}
		} else {
			auth.login()
		}
		return null
	}
	return <div>Checking login...</div>
}

export default Login
