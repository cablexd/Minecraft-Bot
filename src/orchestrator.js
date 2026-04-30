/*
    Orchestrates the agentic loop by putting all managers together.
*/

import { getBot } from './minecraft-client.js'
import { sendEvent } from './prompt-manager.js'
import { handleResponse } from './response-manager.js'

export function start() {
    const bot = getBot()

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return // ignore bot's own messages

        const response = await sendEvent({
            event: 'chat',
            user: username,
            message
        })

        if (response == null) return // invalid response

        handleResponse(response)
    })
}