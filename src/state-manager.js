import fs from 'fs'

const FILE_PATH = 'state.json'

export const STATE = loadState()

export function saveState() {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(STATE, null, 2), 'utf8')
    } catch (err) {
        console.error(`Error saving JSON to ${FILE_PATH}:`, err)
    }
}

function loadState() {
    let state = {}

    try {
        if (fs.existsSync(FILE_PATH)) {
            console.info('Loading state')
            const rawData = fs.readFileSync(FILE_PATH, 'utf8')
            state = (rawData === '') ? {} : JSON.parse(rawData)
        }
    } catch (err) {
        console.error(`Error loading JSON from ${FILE_PATH}:`, err)
    }

    if (state.memories == null) state.memories = []

    return state
}

/* Memories */

/**
 * Calculates the next ID based strictly on the target array
 */
function getNextId(array) {
    if (array.length === 0) return 0
    return Math.max(...array.map(m => m.id)) + 1
}

export function addMemory(memory, priority, category) {
    STATE.memories.push({
        id: getNextId(STATE.memories),
        category,
        priority,
        memory,
        timestamp: Date.now()
    })
}

export function removeMemory(id) {
    STATE.memories = STATE.memories.filter(m => m.id !== id)
}

setInterval(() => {
    saveState()
}, 1000)