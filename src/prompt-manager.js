import fs from 'fs/promises'
import path from 'path'
import { shortTermMemories, longTermMemories } from './memories-manager.js'
import { STATE } from './state-manager.js'
import { promptLlm } from './llm-client.js'
import { getSurroundingBlocks } from './minecraft-client.js'

function generateData(eventData) {
    const data = {}
    data.event = eventData
    data.position = `${parseInt(STATE.position.x)},${parseInt(STATE.position.y)},${parseInt(STATE.position.z)}`
    data.shortTermMemories = shortTermMemories
    data.longTermMemories = longTermMemories
    data.relativeBlocks = getSurroundingBlocks()
    return data
}

export async function sendEvent(eventData) {
    const data = generateData(eventData)

    const systemPrompt = await generatePrompt('simple-bot-refined', {
        name: 'Blake'
    })

    console.info('System prompt:', systemPrompt)

    const response = await promptLlm(systemPrompt, JSON.stringify(data))

    try {
        return JSON.parse(response.response)
    } catch (err) {
        console.error('Invalid LLM json response:', err, response.response)
        return null
    }
}

async function generatePrompt(templateName, data = {}) {
    const filePath = path.join(process.cwd(), 'prompt-templates', `${templateName}.md`)

    try {
        let template = await fs.readFile(filePath, 'utf8')

        // Iterate through data object to replace {{key}} with value
        for (const [key, value] of Object.entries(data)) {
            const placeholder = new RegExp(`{{${key}}}`, 'g')
            template = template.replace(placeholder, value)
        }

        return template
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error(`Prompt template not found: ${filePath}`)
        } else {
            console.error('Error loading prompt:', err)
        }

        return null
    }
}