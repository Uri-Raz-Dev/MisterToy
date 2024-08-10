import { ObjectId } from 'mongodb'
import { asyncLocalStorage } from '../../services/als.service.js'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'

export const reviewService = { query, remove, add, getById }

async function query(filterBy = {}) {
    console.log(filterBy)
    const criteria = {}

    if (filterBy.byUserId) {
        criteria.byUserId = ObjectId.createFromHexString(filterBy.byUserId)
    }
    if (filterBy.toyId) {
        criteria.toyId = ObjectId.createFromHexString(filterBy.toyId)
    }

    try {
        const collection = await dbService.getCollection('review')
        var reviews = await collection
            .aggregate([
                { $match: criteria },
                {
                    $lookup: {
                        localField: 'byUserId',
                        from: 'user',
                        foreignField: '_id',
                        as: 'byUser',
                    },
                },
                {
                    $unwind: '$byUser',
                },
                {
                    $lookup: {
                        localField: 'toyId',
                        from: 'toy',
                        foreignField: '_id',
                        as: 'toy',
                    },
                },
                {
                    $unwind: '$toy',
                },
            ]).toArray()

        reviews = reviews.map(review => {
            delete review.byUser.password
            return review
        })
        return reviews
    } catch (err) {
        logger.error('cannot find reviews', err)
        throw err
    }
}

async function remove(reviewId) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const collection = await dbService.getCollection('review')

        const criteria = { _id: ObjectId.createFromHexString(reviewId) }
        //* remove only if user is owner/admin
        //* If the user is not admin, he can only remove his own reviews by adding byUserId to the criteria
        if (!loggedinUser.isAdmin) {
            criteria.byUserId = ObjectId.createFromHexString(loggedinUser._id)
        }

        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        loggerService.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}

async function add(review, byUser) {
    try {
        const reviewToAdd = {
            byUserId: ObjectId.createFromHexString(byUser._id),
            toyId: ObjectId.createFromHexString(review.toyId),
            txt: review.txt,
        }
        const collection = await dbService.getCollection('review')
        await collection.insertOne(reviewToAdd)
        return reviewToAdd
    } catch (err) {
        loggerService.error('cannot add review', err)
        throw err
    }
}


async function getById(reviewId) {
    try {
        const collection = await dbService.getCollection('review')
        const review = await collection.findOne({ _id: ObjectId.createFromHexString(reviewId) })
        return review
    } catch (err) {
        loggerService.error(`while finding review ${reviewId}`, err)
        throw err
    }
}