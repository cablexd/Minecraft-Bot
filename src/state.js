import fs from 'fs'

const FILE_PATH = 'state.json'

export const state = loadJson()

export function saveState() {
    try {
        console.info('Saving state')
        const jsonString = JSON.stringify(state, null, 2)
        fs.writeFileSync(FILE_PATH, jsonString, 'utf8')
    } catch (err) {
        console.error(`Error saving JSON to ${FILE_PATH}:`, err)
    }
}

export function loadJson() {
    try {
        if (fs.existsSync(FILE_PATH)) {
            console.info('Loading state')
            const rawData = fs.readFileSync(FILE_PATH, 'utf8')
            return JSON.parse(rawData)
        }

        return {}
    } catch (err) {
        console.error(`Error loading JSON from ${FILE_PATH}:`, err)
        return null
    }
}