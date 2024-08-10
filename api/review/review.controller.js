import { userService } from '../user/user.service.js'
import { authService } from '../auth/auth.service.js'
import { reviewService } from './review.service.js'
import { loggerService } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export async function getReview(req, res) {
    try {
        const review = await reviewService.getById(req.params.id)
        res.send(review)
    } catch (err) {
        loggerService.error('Failed to get review', err)
        res.status(500).send({ err: 'Failed to get review' })
    }
}

export async function addReview(req, res) {
    const { loggedinUser } = req
    try {
        const review = await reviewService.add(req.body, loggedinUser)
        res.send(review)
    } catch (err) {
        loggerService.error('Failed to get review', err)
        res.status(500).send({ err: 'Failed to get review' })
    }
}

export async function getReviews(req, res) {
    try {
        const filterBy = {
            byUserId: req.query.byUserId || '',
            toyId: req.query.toyId || '',
        }

        const reviews = await reviewService.query(filterBy)
        res.send(reviews)
    } catch (err) {
        loggerService.error('Failed to get reviews', err)
        res.status(500).send({ err: 'Failed to get reviews' })
    }
}

export async function deleteReview(req, res) {
    var { loggedinUser } = req
    const { id: reviewId } = req.params

    try {
        const deletedCount = await reviewService.remove(reviewId)
        if (deletedCount === 1) {
            socketService.broadcast({ type: 'review-removed', data: reviewId, userId: loggedinUser._id })
            res.send({ msg: 'Deleted successfully' })
        } else {
            res.status(400).send({ err: 'Cannot remove review' })
        }
    } catch (err) {
        loggerService.error('Failed to delete review', err)
        res.status(400).send({ err: 'Failed to delete review' })
    }
}

