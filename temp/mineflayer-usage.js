const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear, GoalFollow } } = require('mineflayer-pathfinder')
const { Vec3 } = require('vec3')

const bot = mineflayer.createBot({
    host: 'localhost',    // Change to your server IP
    port: 55882,          // Change to your server port
    username: 'IdiotSpliks',
    version: '1.16.5',
    viewDistance: 'far'
})

bot._client.on('entity_velocity', packet => {
    if (packet.entityId === bot.entity.id) {
        console.log(`Velocity Packet:`, packet)

        if (packet.velocity && packet.velocityX === undefined) {
            packet.velocityX = packet.velocity.x
            packet.velocityY = packet.velocity.y
            packet.velocityZ = packet.velocity.z
        }
    }
})

bot.loadPlugin(pathfinder)

bot.on('kicked', v => {
    console.log(`kicked:`, v)
})
bot.on('error', v => {
    console.log(`error:`, v)
})

const exampleLlmResponse = {
    chat: 'message',
    moveTo: 'x,y,z',
    lookAt: 'x,y,z',
    equip: 0, // item slot
    breakBlock: 'x,y,z',
    placeBlock: 'x,y,z',
    useBlock: 'x,y,z',
    craft: 'item_name',
    consume: 0, // item slot
    toss: {
        slot: 0,
        amount: 1
    },
    shortTermMemory: ['memory'],
    longTermMemory: ['memory']
}

async function equipItem(slot) {
    const item = bot.inventory.slots[slot]

    if (item) {
        try {
            await bot.equip(item, 'hand');
            console.log(`Successfully equipped item`);
        } catch (err) {
            console.log(`Failed to equip ${slot}: ${err.message}`);
        }
    } else {
        console.log(`I don't have any item in slot ${slot}`);
    }
}

async function craftItem(itemName, amount = 1) {
    const mcData = require('minecraft-data')(bot.version);
    const item = mcData.itemsByName[itemName];

    if (!item) return console.log(`Unknown item: ${itemName}`);

    // 1. Find the recipe
    // null = crafting grid in inventory (2x2)
    // block = crafting table (3x3)
    const table = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 4 });
    const recipe = bot.recipesFor(item.id, null, amount, table)[0];

    if (recipe) {
        try {
            // 2. Execute the craft
            await bot.craft(recipe, amount, table);
            bot.chat(`Crafted ${amount} ${itemName}`);
        } catch (err) {
            bot.chat(`I failed to craft: ${err.message}`);
        }
    } else {
        bot.chat(`I don't have the ingredients for ${itemName}`);
    }
}

async function placeBlockAt(targetCoords) {
    const targetVec = new Vec3(targetCoords.x, targetCoords.y, targetCoords.z);

    // 2. Find a neighbor block to click against
    // We check all 6 directions (down, up, north, south, west, east)
    const faces = [
        { dir: new Vec3(0, -1, 0), face: new Vec3(0, 1, 0) },  // Click top of block below
        { dir: new Vec3(0, 1, 0), face: new Vec3(0, -1, 0) },  // Click bottom of block above
        { dir: new Vec3(1, 0, 0), face: new Vec3(-1, 0, 0) },  // And so on...
        { dir: new Vec3(-1, 0, 0), face: new Vec3(1, 0, 0) },
        { dir: new Vec3(0, 0, 1), face: new Vec3(0, 0, -1) },
        { dir: new Vec3(0, 0, -1), face: new Vec3(0, 0, 1) }
    ];

    let referenceBlock = null;
    let placedFace = null;

    for (const f of faces) {
        const neighbor = bot.blockAt(targetVec.plus(f.dir));
        if (neighbor && neighbor.name !== 'air' && neighbor.name !== 'water') {
            referenceBlock = neighbor;
            placedFace = f.face;
            break;
        }
    }

    if (!referenceBlock) {
        throw new Error("No solid block nearby to place against!");
    }

    // 3. Place the block
    await bot.placeBlock(referenceBlock, placedFace);
}

bot.once('spawn', () => {
    const movement = new Movements(bot)
    movement.canDig = true
    movement.canOpenDoors = true
    movement.dontCreateFlow = true
    movement.allow1by1towers = true
    movement.allowFreeMotion = true
    movement.allowParkour = true
    movement.allowSprinting = true

    bot.physics.yieldInterval = 10000

    bot.on('chat', async (username, message) => {
        if (username === bot.username) return // ignore bot messages

       if (message === 'toss') {
            await bot.toss(bot.heldItem.type, null, 2)
        } else if (message === 'consume') {
            await bot.consume()
        } else if (message.startsWith('place ')) {
            const parts = message.split(' ');
            if (parts.length !== 4) return bot.chat("Usage: place x y z");

            const x = parseInt(parts[1]);
            const y = parseInt(parts[2]);
            const z = parseInt(parts[3]);
            const targetPos = new Vec3(x, y, z);

            console.log(`Attempting to place block at: ${targetPos}`);

            try {
                await placeBlockAt(targetPos);
                bot.chat(`Placed block at ${x} ${y} ${z}`);
            } catch (err) {
                bot.chat(`Error: ${err.message}`);
                console.error(err);
            }
        } else if (message === 'inv') {
            const items = {}

            for (let item of bot.inventory.slots) {
                if (item == null) continue
                items[item.slot] = item.name
            }

            console.log(items)
        } else if (message.startsWith('equip')) {
            const itemName = message.substring(6)
            console.log(`equipping: ${itemName}`)
            equipItem(itemName)
        } else if (message.startsWith('craft')) {
            const itemName = message.substring(6)
            console.log(`crafting: ${itemName}`)
            craftItem(itemName)
        } else if (message === 'jump') {
            bot.setControlState('jump', true)
        } else if (message === 'come') {
            const target = bot.players[username]?.entity

            if (target == null) {
                bot.chat("I don't see you!")
            } else {
                bot.chat("I'm coming!")

                const { x: playerX, y: playerY, z: playerZ } = target.position

                bot.pathfinder.setMovements(movement)
                bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, 2))
                // bot.pathfinder.setGoal(new GoalFollow(target, 2))
            }
        }
    })

    bot.on('physicsTick', () => {
        // const target = bot.nearestEntity(entity => entity.type === 'player')

        // if (target) {
        //     // Look at the player's eye level (position + height)
        //     const eyePosition = target.position.offset(0, target.height, 0)
        //     bot.lookAt(eyePosition)
        // }
    })
})