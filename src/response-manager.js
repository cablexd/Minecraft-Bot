import { STATE, addMemory, removeMemory } from './state-manager.js'
import { chat, moveTo, whisper } from './minecraft-client.js'

export function handleResponse(response) {
    console.info(`Handling response:`, JSON.stringify(response, null, 2))
    handleActions(response)
}

async function handleActions(response) {
    if (response.actions == null) return

    const { actions } = response

    for (let action of actions) {
        console.info(`Handling action: ${action.type}`)

        switch (action.type) {
            case 'chat':
                chat(action.message)
                break
            case 'forget':
                removeMemory(action.id)
                break
            case 'move':
                const pos = action.pos.split(',').map(Number)

                try {
                    await moveTo(pos[0], pos[1], pos[2])
                } catch (err) {
                    console.error('Minecraft client failed to move:', err)
                }

                break
            case 'remember':
                addMemory(action.memory, parseInt(action.priority), action.category)
                break
            case 'whisper':
                whisper(action.player, action.message)
                break
        }
    }
}