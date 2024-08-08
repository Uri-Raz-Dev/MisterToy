import { authService } from '../api/auth/auth.service.js'
import { asyncLocalStorage } from '../services/als.service.js'
export async function setupAsyncLocalStorage(req, res, next) {
    const storage = {}

    asyncLocalStorage.run(storage, () => {
        console.log('Running async local storage setup')
        if (!req.cookies?.loginToken) {
            console.log('No login token found in cookies')
            return next()
        }
        console.log('Login token found in cookies')

        const loggedinUser = authService.validateToken(req.cookies.loginToken)
        if (loggedinUser) {
            const alsStore = asyncLocalStorage.getStore()
            alsStore.loggedinUser = loggedinUser
            console.log('Logged-in user set in async local storage:', loggedinUser)
        } else {
            console.log('Invalid login token')
        }

        next()
    })
}
