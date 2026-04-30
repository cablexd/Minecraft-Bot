import fs from 'fs'

const FILE_PATH = 'state.json'

export const STATE = loadState()

export function saveState() {
    try {
        console.info('Saving state')
        const jsonString = JSON.stringify(STATE, null, 2)
        fs.writeFileSync(FILE_PATH, jsonString, 'utf8')
    } catch (err) {
        console.error(`Error saving JSON to ${FILE_PATH}:`, err)
    }
}

function loadState() {
    try {
        if (fs.existsSync(FILE_PATH)) {
            console.info('Loading state')
            const rawData = fs.readFileSync(FILE_PATH, 'utf8')
            return (rawData === '') ? {} : JSON.parse(rawData)
        }

        return {}
    } catch (err) {
        console.error(`Error loading JSON from ${FILE_PATH}:`, err)
        return {}
    }
}