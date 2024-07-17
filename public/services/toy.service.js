import fs from 'fs'
import { loggerService } from "./logger.service.js"
import { utilService } from "./util.service.js"


export const toyService = {
    query,
    getById,
    save,
    remove
}
const toys = utilService.readJsonFile('data/toy.json')


function query(filterBy = {}) {
    const regex = new RegExp(filterBy.name, 'i')
    let toysToReturn = toys.filter(toy => regex.test(toy.name))
    if (filterBy.name) {
        toysToReturn = toysToReturn.filter(toy => regex.test(toy.name))
    }
    if (filterBy.price) {
        toysToReturn = toysToReturn.filter(toy => toy.price >= filterBy.price)
    }
    if (filterBy.labels) {
        toysToReturn = toysToReturn.filter(toy => {
            return filterBy.labels.every(label => {
                const lowercaseLabel = label.toLowerCase()
                return toy.labels.map(l => l.toLowerCase()).includes(lowercaseLabel)
            })
        })
    }
    if (filterBy.createdAt) {
        toysToReturn = toysToReturn.sort((a, b) => {
            if (filterBy.createdAt === 'true') {
                return b.createdAt - a.createdAt
            } else if (filterBy.createdAt === 'false') {
                return a.createdAt - b.createdAt
            } else {
                return 0
            }
        })
    }
    if (filterBy.inStock) {
        toysToReturn = toysToReturn.filter(toy => {
            if (filterBy.inStock === 'true') {
                return toy.inStock
            } else if (filterBy.inStock === 'false') {
                return !toy.inStock
            } else {
                return toy
            }


        })
    }
    return Promise.resolve(toysToReturn)
}

function getById(id) {
    const toy = toys.find(toy => toy._id === id)
    return Promise.resolve(toy)
}

function remove(toyId, loggedinUser) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('Toy not found')
    const toy = toys[idx]
    if (!loggedinUser.isAdmin && toy.owner._id !== loggedinUser._id) {
        return Promise.reject('Access denied')
    }
    toys.splice(idx, 1)
    return _saveToyToFile()
}

function save(toy, loggedinUser) {
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)
        if (!loggedinUser.isAdmin && toyToUpdate.owner._id !== loggedinUser._id) {
            return Promise.reject('Access denied')
        }
        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
        toyToUpdate.labels = toy.labels
        toyToUpdate.inStock = toy.inStock
        toy = toyToUpdate
    } else {
        toy._id = utilService.makeId()
        toy.owner = {
            fullName: loggedinUser.fullName,
            _id: loggedinUser._id,
            isAdmin: loggedinUser.isAdmin
        }
        toys.push(toy)
    }
    return _saveToyToFile().then(() => toy)
}
function _saveToyToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toy file', err)
                return reject(err)
            } else {
                resolve()
            }
        })
    })
}