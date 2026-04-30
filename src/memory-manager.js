import fs from 'fs'

export let shortTermMemories = []
export let longTermMemories = []

/**
 * Calculates the next ID based strictly on the target array
 */
function getNextId(array) {
    if (array.length === 0) return 0
    return Math.max(...array.map(m => m.id)) + 1
}

export function addShortTermMemory(memory) {
    shortTermMemories.push({
        id: getNextId(shortTermMemories),
        memory
    })
}

export function addLongTermMemory(memory) {
    longTermMemories.push({
        id: getNextId(longTermMemories),
        memory
    })
}

export function removeShortTermMemory(id) {
    shortTermMemories = shortTermMemories.filter(m => m.id !== id)
}

export function removeLongTermMemory(id) {
    longTermMemories = longTermMemories.filter(m => m.id !== id)
}

function saveMemoryTypeToFile(type) {
    const filename = `${type}_term_memories.json`
    const data = type === 'short' ? shortTermMemories : longTermMemories

    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8')
        console.info(`Saved ${type} term memories to file`)
    } catch (err) {
        console.error(`Failed to save ${type} memories:`, err)
    }
}

export function saveMemoriesToFile() {
    saveMemoryTypeToFile('short')
    saveMemoryTypeToFile('long')
}

async function loadMemoriesFromFile(type) {
    const filename = `${type}_term_memories.json`

    try {
        await fs.promises.access(filename)
        const rawData = await fs.promises.readFile(filename, 'utf8')
        const parsed = JSON.parse(rawData)

        if (type === 'short') {
            shortTermMemories = parsed
        } else {
            longTermMemories = parsed
        }

        console.info(`Loaded ${type} term memories from file`)
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.error(`Failed to load ${type} term memories:`, err)
        }
    }
}

export async function initialize() {
    await Promise.all([
        loadMemoriesFromFile('short'),
        loadMemoriesFromFile('long')
    ])
}