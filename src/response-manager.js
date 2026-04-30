import { addShortTermMemory, addLongTermMemory, removeShortTermMemory, removeLongTermMemory } from './memories-manager.js'
import { STATE } from './state-manager.js'
import { chat, moveTo } from './minecraft-client.js'

export function handleResponse(response) {
    console.info(`Handling response:`, JSON.stringify(response, null, 2))
    handleMemories(response)
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
            case 'move':
                const pos = action.pos.split(',').map(Number)
                try {
                    await moveTo(pos[0], pos[1], pos[2])
                } catch (err) {
                    console.error('Minecraft client failed to move:', err)
                }

                break
        }
    }
}

function handleMemories(response) {

    /* Add Memories */

    if (response.addShort) {
        for (let memory of response.addShort) {
            addShortTermMemory(memory)
        }
    }
    if (response.addLong) {
        for (let memory of response.addLong) {
            addLongTermMemory(memory)
        }
    }

    /* Remove Memories */

    if (response.forgetShort) {
        for (let id of response.forgetShort) {
            removeShortTermMemory(id)
        }
    }
    if (response.forgetLong) {
        for (let id of response.forgetLong) {
            removeLongTermMemory(id)
        }
    }
}