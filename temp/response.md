### 1. The Input Stream (What I need to know)
I need a concise summary of the **World State** and **Bot State**. I do not need raw camera frames (too slow) or every block in the world (too heavy). I need **semantic data**.

**Frequency:** Every `tick` (or every few seconds) depending on the bot's action cycle.

#### Ideal Input JSON Structure
This JSON represents the "Situation Awareness" packet.

```json
{
  "timestamp": 1715667890000,
  "bot_state": {
    "health": 20,
    "armor": 10,
    "held_item": "minecraft:stick",
    "hotbar_slots": {
      "0": "minecraft:sapling",
      "1": "minecraft:stick",
      "2": "minecraft:stick",
      "3": "minecraft:coal_block",
      "4": null
    },
    "current_goal": "mining_coal",
    "status": "moving"
  },
  "nearby_entities": [
    {
      "id": "minecraft:creeper",
      "pos": [-2, 62, 4],
      "distance": 3.5,
      "state": "approaching"
    },
    {
      "id": "minecraft:pillager",
      "pos": [50, 62, 100],
      "distance": 120,
      "state": "idle"
    }
  ],
  "nearby_blocks": [
    {
      "id": "minecraft:coal_ore",
      "pos": [-2, 61, 4],
      "height_level": 61,
      "block_type": "ore"
    },
    {
      "id": "minecraft:dirt",
      "pos": [0, 62, 0],
      "height_level": 62,
      "block_type": "ground"
    }
  ],
  "resource_cache": {
    "craftable_items": [
      {"item": "minecraft:coal_block", "count": 2, "slots": [3]},
      {"item": "minecraft:stick", "count": 10, "slots": [1, 2]}
    ],
    "missing_materials_for_current_goal": ["minecraft:coal_block"],
    "available_tools": ["minecraft:iron_pickaxe"]
  },
  "environment": {
    "sky_time": 10000,
    "light_level": 12,
    "biome": "plains"
  }
}
```

#### Why this input?
*   **`bot_state.held_item`**: Tells me if I need to tell the bot to switch tools or pick up something.
*   **`nearby_blocks.id` + `height_level`**: Allows me to infer geometry without a full voxel dump. If it says `coal_ore` at `-1` relative height, I know to dig down.
*   **`resource_cache`**: I need to know what is *already* in the hotbar vs. what I need to craft. I don't need the full chest inventory if the goal doesn't require chest searching.
*   **`nearby_entities.state`**: Crucial for combat logic. If a Creeper is "approaching," my output changes immediately.

---

### 2. The Output Stream (How I control the bot)
I will not output movement vectors (e.g., `move_forward(0.1)`). I output **High-Level Commands** or **Reasoning States**.

The bot agent (the body) listens for these commands.
*   **Command Type:** `NAVIGATE`, `CRAFT`, `HARVEST`, `ATTACK`, `WAIT_FOR`.
*   **Priority System:** Commands have a priority. If I say `RUN_AWAY`, the bot ignores `CRAFT`.

#### Ideal Output JSON Structure
This is the "Action Command" packet.

```json
{
  "action_type": "CRAFT_AND_MOVE",
  "priority": "HIGH",
  "context_reasoning": "Need coal_block for furnace fuel. Found ore at [-2, 61, 4]. Must break it, smelt it, then craft block while moving away from Creeper.",
  "commands": [
    {
      "type": "HARVEST",
      "target": {
        "block_id": "minecraft:coal_ore",
        "pos": [-2, 61, 4],
        "use_tool_slot": 2,
        "use_tool_id": "minecraft:iron_pickaxe"
      },
      "success_callback": "on_coal_obtained"
    },
    {
      "type": "SMART_CRAFTING",
      "input_recipe": "minecraft:crafting_shapeless",
      "output": "minecraft:coal_block",
      "ingredients": [
        { "id": "minecraft:coal", "count": 9 }
      ],
      "note": "Use furnace slot 0, then move to crafting table slot 1"
    },
    {
      "type": "NAVIGATE",
      "target_pos": [-2, 62, 4],
      "pathing_mode": "elevate_after_harvest",
      "avoid_entities": true
    },
    {
      "type": "SWAP_HOLDS",
      "from_slot": 0,
      "to_slot": 2,
      "item_id": "minecraft:coal_block"
    }
  ],
  "failure_handling": {
    "if_recipe_missing": "Search_chest_for_coal",
    "if_obstacle_blocked": "Find_alternate_path_to_pos",
    "if_entity_detected": {
      "condition": "entity_too_close",
      "action": "EXECUTE_COMMAND: RUN_AWAY",
      "target": "minecraft:creeper"
    }
  }
}
```

### 3. How the Loop Works (The Logic Flow)

1.  **Perception:** The bot scans its 3-5 block radius. It sends the **Input JSON** to me.
2.  **Reasoning:** I analyze the input.
    *   *Scenario A:* No ore nearby. -> I output `NAVIGATE` to the last known resource location.
    *   *Scenario B:* Ore found, but Creeper approaching. -> I output `ATTACK` or `RUN_AWAY` first.
    *   *Scenario C:* Ore safe. -> I output `HARVEST` -> `SMART_CRAFTING` -> `NAVIGATE`.
3.  **Execution:** The bot executes the `commands` array.
4.  **Feedback:** The bot tries the action. If it fails (e.g., the block didn't break), it might retry or signal an error. If it succeeds, it updates the `hotbar_slots` and sends the next Input JSON.

### 4. High-Level Logic Capabilities I Enable

With this setup, you don't need to code every step. You just define the **Goal**, and I handle the **Plan**:

*   **"Go get iron"** -> I look for ore, navigate, harvest, smelt, craft, and hold the item. I skip the "search chest" if the goal is urgent.
*   **"Build a house"** -> I ask for the Input JSON of the ground. I output `HARVEST` (trees for wood), `CRAFT` (planks), and a sequence of `PLACE_BLOCK` coordinates to build walls/roof.
*   **"Make a shield"** -> I check inventory. If missing iron ingot, I navigate to ore, harvest, smelt. If I have iron but no crafting table, I navigate to find one.

### 5. Technical Constraints & Requirements

To make this work in a real autonomous bot (like a Fabric/Forge mod or a Bedrock plugin):

1.  **Latency:** The input/output JSON must be compact. No verbose strings. Use enums for states (`IDLE`, `MOVING`, `CRAFTING`).
2.  **Statelessness:** I don't remember the world between messages. **Every Input JSON must contain the current state.** I cannot say "remember we got the wood earlier." The bot must tell me "I have 20 wood."
3.  **Pathfinding Offload:** I will **never** calculate pathfinding myself. I will say `NAVIGATE_TO([-5, 62, 10])`. The bot uses its built-in A*/NavGoo to get there. My job is *where* to go, not *how* to get there.
4.  **Error Propagation:** If the bot dies or the world changes drastically, the Input JSON will reflect that (`health: 0`). My output should switch to `WAIT_FOR_RESPAWN` or `SCANNING_AREA`.

### Summary
*   **I want:** Semantic snapshots (What am I holding? What is nearby? Who is attacking me?).
*   **I give:** Sequences of high-level commands (Harvest this, Craft that, Go there, Avoid that).
*   **I handle:** Logic, strategy, and decision trees.
*   **The Bot handles:** Physics, rendering, pathfinding, and API calls to the game engine.

This turns you into a strategist and the bot into a soldier. Would you like to simulate a specific scenario (e.g., "Building a Nether Portal") where you provide the Input JSON, and I generate the Output Command sequence?