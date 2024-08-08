import { ObjectId } from 'mongodb'
import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'

export const toyService = {
	remove,
	query,
	getById,
	add,
	update,
	addToyMsg,
	removeToyMsg,
}

const PAGE_SIZE = 4

async function query(filterBy = { name: '', price: 0, labels: [], createdAt: '', inStock: '' }, pageIdx) {
	try {
		const criteria = {}

		if (filterBy.name) {
			criteria.name = { $regex: filterBy.name, $options: 'i' }
		}
		if (filterBy.price) {
			criteria.price = { $gte: filterBy.price }
		}
		if (filterBy.labels && filterBy.labels.length > 0) {
			criteria.labels = { $all: filterBy.labels.map(label => new RegExp(label, 'i')) }
		}
		if (filterBy.inStock !== '') {
			criteria.inStock = filterBy.inStock === 'true'
		}

		console.log('Query criteria:', criteria)

		const collection = await dbService.getCollection('toy')
		let queryCursor = collection.find(criteria)

		if (filterBy.createdAt) {
			const sortDirection = filterBy.createdAt === 'true' ? -1 : 1
			queryCursor = queryCursor.sort({ createdAt: sortDirection })
		}

		if (pageIdx !== undefined) {
			queryCursor = queryCursor.skip(pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
		}

		const toys = await queryCursor.toArray()
		console.log('Fetched toys:', toys)
		return toys
	} catch (err) {
		loggerService.error('cannot find toys', err)
		throw err
	}
}

async function getById(toyId) {
	try {
		const collection = await dbService.getCollection('toy')
		const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
		toy.createdAt = toy._id.getTimestamp()
		return toy
	} catch (err) {
		loggerService.error(`while finding toy ${toyId}`, err)
		throw err
	}
}

async function remove(toyId) {
	try {
		const collection = await dbService.getCollection('toy')
		const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
		return deletedCount
	} catch (err) {
		loggerService.error(`cannot remove toy ${toyId}`, err)
		throw err
	}
}

async function add(toy) {
	try {
		const collection = await dbService.getCollection('toy')
		await collection.insertOne(toy)
		return toy
	} catch (err) {
		loggerService.error('cannot insert toy', err)
		throw err
	}
}

async function update(toy) {
	try {
		const toyToSave = {
			name: toy.name,
			price: toy.price,
			labels: toy.labels,
			inStock: toy.inStock,
			createdAt: Date.now()
		}
		const collection = await dbService.getCollection('toy')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: toyToSave })
		return toy
	} catch (err) {
		loggerService.error(`cannot update toy ${toy._id}`, err)
		throw err
	}
}

async function addToyMsg(toyId, msg) {
	try {
		msg.id = utilService.makeId()

		const collection = await dbService.getCollection('toy')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $push: { msgs: msg } })
		return msg
	} catch (err) {
		loggerService.error(`cannot add toy msg ${toyId}`, err)
		throw err
	}
}

async function removeToyMsg(toyId, msgId) {
	try {
		const collection = await dbService.getCollection('toy')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $pull: { msgs: { id: msgId } } })
		return msgId
	} catch (err) {
		loggerService.error(`cannot add toy msg ${toyId}`, err)
		throw err
	}
}