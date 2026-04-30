const SEARCH_CONFIG = {
    shell: {
        radius: 4,
        count: 30
    },
    categories: [
        {
            name: 'utilities',
            exactMatches: [
                'chest', 'trapped_chest', 'ender_chest', 'barrel', 'shulker_box',
                'furnace', 'blast_furnace', 'smoker', 'crafting_table', 'anvil',
                'chipped_anvil', 'damaged_anvil', 'enchanting_table', 'brewing_stand',
                'white_bed', 'orange_bed', 'magenta_bed', 'light_blue_bed', 'yellow_bed', 'lime_bed', 'pink_bed', 'gray_bed', 'light_gray_bed', 'cyan_bed', 'purple_bed', 'blue_bed', 'brown_bed', 'green_bed', 'red_bed', 'black_bed',
                'oak_door', 'spruce_door', 'birch_door', 'jungle_door', 'acacia_door', 'dark_oak_door', 'mangrove_door', 'cherry_door', 'bamboo_door', 'crimson_door', 'warped_door', 'iron_door',
                'torch', 'soul_torch', 'redstone_torch', 'lantern', 'soul_lantern', 'campfire', 'soul_campfire'
            ],
            radius: 32,
            count: 25
        },
        {
            name: 'nature',
            exactMatches: [
                'oak_log', 'spruce_log', 'birch_log', 'jungle_log', 'acacia_log', 'dark_oak_log', 'mangrove_log', 'cherry_log', 'bamboo_block', 'crimson_stem', 'warped_stem',
                'oak_leaves', 'spruce_leaves', 'birch_leaves', 'jungle_leaves', 'acacia_leaves', 'dark_oak_leaves', 'mangrove_leaves', 'cherry_leaves', 'azalea_leaves', 'flowering_azalea_leaves',
                'sugar_cane', 'cactus', 'pumpkin', 'melon', 'wheat', 'carrots', 'potatoes', 'beetroots', 'sweet_berry_bush',
                'brown_mushroom', 'red_mushroom', 'crimson_fungus', 'warped_fungus', 'bee_nest', 'beehive'
            ],
            radius: 32,
            count: 30
        },
        {
            name: 'resources',
            exactMatches: [
                'coal_ore', 'deepslate_coal_ore',
                'iron_ore', 'deepslate_iron_ore', 'raw_iron_block',
                'copper_ore', 'deepslate_copper_ore', 'raw_copper_block',
                'gold_ore', 'deepslate_gold_ore', 'nether_gold_ore', 'raw_gold_block',
                'redstone_ore', 'deepslate_redstone_ore',
                'lapis_ore', 'deepslate_lapis_ore',
                'diamond_ore', 'deepslate_diamond_ore',
                'emerald_ore', 'deepslate_emerald_ore',
                'nether_quartz_ore', 'ancient_debris', 'gilded_blackstone'
            ],
            radius: 32,
            count: 25
        }
    ]
}

const EXCLUDE_AIR = ['air', 'cave_air', 'void_air']

export function getNearbyBlocksInternal(bot) {
    const interestingBlocks = []
    const typeCounts = {}

    const tryAddBlock = (block) => {
        if (!block) return
        const name = block.name
        typeCounts[name] = (typeCounts[name] ?? 0)

        if (typeCounts[name] < 3) {
            interestingBlocks.push({
                id: name,
                pos: [block.position.x, block.position.y, block.position.z]
            })
            typeCounts[name]++
        }
    }

    // 1. Immediate Shell Search (Radius 4, excludes only air)
    const shellPoints = bot.findBlocks({
        matching: block => !EXCLUDE_AIR.includes(block.name),
        maxDistance: SEARCH_CONFIG.shell.radius,
        count: SEARCH_CONFIG.shell.count
    })
    shellPoints.forEach(p => tryAddBlock(bot.blockAt(p)))

    // 2. Categorized Searches (Exact Name Matching)
    for (const cat of SEARCH_CONFIG.categories) {
        const points = bot.findBlocks({
            matching: block => cat.exactMatches.includes(block.name),
            maxDistance: cat.radius,
            count: cat.count
        })
        points.forEach(p => tryAddBlock(bot.blockAt(p)))
    }

    // 3. Final Deduplication (by coordinate string)
    return interestingBlocks.filter((v, i, a) =>
        a.findIndex(t => t.pos.join(',') === v.pos.join(',')) === i
    )
}