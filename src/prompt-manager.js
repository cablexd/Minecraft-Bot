import fs from 'fs/promises'
import path from 'path'
import { promptLlm } from './llm-client.js'
import { shortTermMemories, longTermMemories } from './memory-manager.js'
import { state } from './state.js'

function addData(data) {
    data.position = `${state.position.x},${state.position.y},${state.position.z}`
    data.shortTermMemories = shortTermMemories
    data.longTermMemories = longTermMemories
    return data
}

export async function sendEvent(data) {
    addData(data)
    const prompt = await generatePrompt('simple-bot', {
        name: 'Lark',
        userMessage: JSON.stringify(data)
    })

    console.info('Prompting:', prompt)
    console.info('Data:', data)
    const response = await promptLlm(prompt)

    try {
        return JSON.parse(response.response)
    } catch (err) {
        console.error('Invalid LLM json response:', err)
    }
}

async function generatePrompt(templateName, data = {}) {
    const filePath = path.join(process.cwd(), 'prompt-templates', `${templateName}.txt`)

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