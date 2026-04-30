/*
    Handles talking directly with the LLM and the context of the current session.
*/

import fs from 'fs/promises'

const CONTEXT_FILE_NAME = 'context.csv'

let context = loadContext()

export async function promptLlm(systemPrompt, prompt) {
    const url = 'http://localhost:11434/api/generate'

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'qwen3.5',
            system: systemPrompt,
            prompt,
            stream: false,
            think: false,
            context: await context,
            options: {
                num_predict: 2048,
                num_ctx: 2048
            }
        })
    })

    const data = await response.json()
    context = data.context
    saveContext()
    return data
}

async function saveContext() {
    try {
        await fs.writeFile(CONTEXT_FILE_NAME, context.join(','), 'utf8')
    } catch (err) {
        console.error('Error saving context:', err)
    }
}

async function loadContext() {
    try {
        const data = await fs.readFile(CONTEXT_FILE_NAME, 'utf8')
        const c = data.split(',')
        return (c[0] === '') ? [] : c.map(Number)
    } catch (err) {
        if (err.code === 'ENOENT') {
            return []
        }

        console.error('Error loading context:', err)
        return null
    }
}