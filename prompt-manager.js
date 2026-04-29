import fs from 'fs/promises'
import path from 'path'

export async function getPrompt(templateName, data = {}) {
    const filePath = path.join(process.cwd(), 'prompts', `${templateName}.txt`)

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