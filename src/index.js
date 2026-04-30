import 'dotenv/config'
import { saveState } from './state-manager.js'
import { connect as connectMinecraftClient } from './minecraft-client/minecraft-client.js'
import { start } from './orchestrator.js'

let exited = false

function onExit() {
    if (exited) return
    exited = true

    console.log('onExit()')
    saveState()
}

process.on('SIGINT', () => {
    onExit()
    process.exit(0)
})
process.on('exit', onExit)

connectMinecraftClient()
start()