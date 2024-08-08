import { config } from '../config/index.js'
import { asyncLocalStorage } from '../services/als.service.js'
import { loggerService } from '../services/logger.service.js'
export function requireAuth(req, res, next) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    req.loggedinUser = loggedinUser
    console.log('Logged in user:', loggedinUser);
    if (config.isGuestMode && !loggedinUser) {
        req.loggedinUser = { _id: '', fullname: 'Guest' }
        return next()
    }
    if (!loggedinUser) return res.status(401).send('Not Authenticated')
    console.log('Authenticated user:', req.loggedinUser)
    next()
}

export function requireAdmin(req, res, next) {
    const { loggedinUser } = asyncLocalStorage.getStore()

    if (!loggedinUser) return res.status(401).send('Not Authenticated')
    if (!loggedinUser.isAdmin) {
        loggerService.warn(loggedinUser.fullname + 'attempted to perform admin action')
        res.status(403).end('Not Authorized')
        return
    }
    next()
}
