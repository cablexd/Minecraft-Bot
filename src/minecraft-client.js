import mineflayer from 'mineflayer'
import mineflayerPathfinder from 'mineflayer-pathfinder'
import minecraftData from 'minecraft-data'
import { STATE } from './state-manager.js'

const { pathfinder, Movements, goals } = mineflayerPathfinder

const USERNAME = 'Blake'

let bot

export function connect() {
    const port = process.env.MINECRAFT_PORT ?? 25565
    console.info(`Connecting to Minecraft server localhost:${port} version ${process.env.MINECRAFT_VERSION}`)
    bot = mineflayer.createBot({
        host: 'localhost',
        port,
        username: USERNAME,
        version: process.env.MINECRAFT_VERSION,
        viewDistance: 'far'
    })

    console.info('Minecraft client connected to server')
    handleBot(bot)
}

function checkInitialized() {
    if (bot == null) {
        throw Error('Minecraft client has not been initialized')
    }
}

export function getBot() {
    checkInitialized()
    return bot
}

export function chat(message) {
    bot.chat(message)
}

export function getSurroundingBlocks() {
    checkInitialized()

    const radius = 3
    const blocks = []

    for (let x = -radius; x <= radius; x++) {
        for (let y = -1; y <= 2; y++) {
            for (let z = -radius; z <= radius; z++) {
                const block = bot.blockAt(bot.entity.position.offset(x, y, z))

                if (block.name !== 'air') {
                    blocks.push({
                        pos: [x, y, z],
                        id: block.name
                    })
                }
            }
        }
    }

    return blocks
}

export function moveTo(x, y, z) {
    bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z))
}

function createMovements() {
    checkInitialized()

    const movements = new Movements(bot, minecraftData(bot.version))
    movements.canDig = true
    movements.canOpenDoors = true
    movements.dontCreateFlow = true
    movements.allow1by1towers = true
    movements.allowParkour = true
    movements.allowSprinting = true
    return movements
}

function handleBot() {
    checkInitialized()

    bot.loadPlugin(pathfinder)

    bot.once('spawn', () => {
        bot.pathfinder.setMovements(createMovements()) // setup pathfinding
        STATE.position = bot.entity.position

        bot.on('chat', (username, message) => {
            if (message === 'blocks') {
                const blocks = getSurroundingBlocks()
                console.log(blocks)
            } else if (message === 'come') {
                const target = bot.players[username]?.entity

                if (target == null) {
                    bot.chat('I don\'t see you!')
                } else {
                    bot.chat('I\'m coming!')
                    const pos = target.position
                    moveTo(pos.x, pos.y, pos.z)
                }
            }
        })
    })

    // required to fix a velocity packet field mismatch that makes the bot act incorrectly
    bot._client.on('entity_velocity', packet => {
        if (packet.entityId === bot.entity.id) {
            packet.velocityX = packet.velocity.x
            packet.velocityY = packet.velocity.y
            packet.velocityZ = packet.velocity.z
        }
    })

    bot.on('kicked', v => {
        console.log(`Minecraft client kicked from server:`, v)
    })
    bot.on('error', v => {
        console.log(`Minecraft client error:`, v)
    })
}