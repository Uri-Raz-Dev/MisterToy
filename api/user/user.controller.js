import { loggerService } from '../../public/services/logger.service.js'
import { userService } from './user.service.js'

export async function getUser(req, res) {
    try {
        const user = await userService.getById(req.params.id)
        res.send(user)
    } catch (err) {
        loggerService.error('Failed to get user', err)
        res.status(500).send({ err: 'Failed to get user' })
    }
}

export async function getUsers(req, res) {
    try {
        const filterBy = {
            txt: req.query?.txt || '',
        }
        const users = await userService.query(filterBy)
        res.send(users)
    } catch (err) {
        loggerService.error('Failed to get users', err)
        res.status(500).send({ err: 'Failed to get users' })
    }
}

export async function deleteUser(req, res) {
    try {
        await userService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        loggerService.error('Failed to delete user', err)
        res.status(500).send({ err: 'Failed to delete user' })
    }
}

export async function updateUser(req, res) {
    try {
        const user = req.body
        const savedUser = await userService.update(user)
        res.send(savedUser)
    } catch (err) {
        loggerService.error('Failed to update user', err)
        res.status(500).send({ err: 'Failed to update user' })
    }
}