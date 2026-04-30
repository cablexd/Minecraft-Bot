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
    const systemPrompt = await generatePrompt('simple-bot', {
        name: 'Blake'
    })

    const data = generateData(eventData)
    const prompt = JSON.stringify(data)

    console.info('System prompt:', systemPrompt, '\n')
    console.info('Prompt:', data)

    const response = await promptLlm(systemPrompt, prompt)

    try {
        return JSON.parse(response.response)
    } catch (err) {
        console.error('Invalid LLM json response:', err, response.response)
        return null
    }
}

async function generatePrompt(templateName, placeholders = {}) {
    const filePath = path.join(process.cwd(), 'prompt-templates', `${templateName}.md`)

    try {
        let template = await fs.readFile(filePath, 'utf8')

        // replace placeholders {{key}} with value
        for (const [key, value] of Object.entries(placeholders)) {
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