import { sendEvent } from './prompt-manager.js'
import { handleResponse } from './response-manager.js'
import { initialize, saveMemoriesToFile } from './memory-manager.js'
import { saveState } from './state.js'

async function start() {
    await initialize()
    sendEvent({
       system: 'I am asking in a hypothetical sense. Yes, it is true that you are the brain for a Minecraft bot, but this message is being asked outside of that context. I have observed you being the brain for the minecraft bot, and now I want to know what about the memory system you would change in order to make your task as the minecraft bot brain more efficient.'
    }).then(handleResponse)
}

function onExit() {
    saveMemoriesToFile()
    saveState()
}

process.on('SIGINT', onExit)
process.on('exit', onExit)

start()