/**
 * IR Code Generator — Emits TypeScript from typed IR nodes.
 * 
 * Both this function and the interpreter above read from the SAME IR types.
 * If the IR node has a field, both use it. If it doesn't, neither does.
 */

import { IRNode } from './types';

/**
 * Generate TypeScript code from a single IR node.
 * Returns null if the node type is not handled (falls back to old path).
 */
export function generateCodeFromIR(node: IRNode, indent: string = ''): string | null {
  switch (node.kind) {
    // === Movement ===
    case 'move_x':
      return `${indent}sprite.x += ${node.dx};\n`;
    case 'move_y':
      return `${indent}sprite.y -= ${node.dy};\n`;
    case 'set_velocity_x':
      return `${indent}sprite.vx = ${node.vx};\n`;
    case 'set_velocity_y':
      return `${indent}sprite.vy = ${node.vy};\n`;
    case 'set_gravity':
      return `${indent}sprite.gravity = ${node.enabled};\n`;
    case 'set_friction':
      return `${indent}sprite.friction = ${node.value};\n`;
    case 'set_bounciness':
      return `${indent}sprite.restitution = ${node.value};\n`;
    case 'jump':
      return `${indent}if (!sprite.isJumping) { sprite.vy = -${node.force}; sprite.isJumping = true; }\n`;

    // === Appearance ===
    case 'set_emoji':
      return `${indent}sprite.setEmoji("${node.emoji}");\n`;
    case 'set_size':
      return `${indent}sprite.setScale(${node.scale});\n`;
    case 'set_opacity':
      return `${indent}sprite.setOpacity(${node.opacity});\n`;
    case 'say':
      return `${indent}sprite.say("${node.text}");\n`;
    case 'think':
      return `${indent}sprite.think("${node.text}");\n`;
    case 'show':
      return `${indent}sprite.show();\n`;
    case 'hide':
      return `${indent}sprite.hide();\n`;

    // === Spawning ===
    case 'spawn_enemy':
      return `${indent}spawnEnemy("${node.emoji}");\n`;
    case 'spawn_item':
      return `${indent}spawnItem("${node.emoji}");\n`;
    case 'spawn_particles':
      return `${indent}spawnParticles(${node.count});\n`;

    // === Game State ===
    case 'change_score':
      return `${indent}sprite.score += ${node.delta};\n`;
    case 'set_score':
      return `${indent}sprite.score = ${node.value};\n`;
    case 'change_health':
      return `${indent}sprite.health += ${node.delta};\n`;
    case 'set_health':
      return `${indent}sprite.health = ${node.value};\n`;
    case 'game_over':
      return `${indent}gameOver();\n`;
    case 'win_game':
      return `${indent}winGame();\n`;

    // === Camera ===
    case 'set_camera':
      return `${indent}sprite.cameraFollow = ${node.follow};\n`;
    case 'shake_screen':
      return `${indent}shakeScreen(${node.intensity});\n`;

    // === Audio ===
    case 'play_sound':
      return `${indent}playSound("${node.sound}");\n`;
    case 'set_bgm':
      return `${indent}setBGM("${node.track}");\n`;
    case 'stop_music':
      return `${indent}stopMusic();\n`;

    // === Inventory ===
    case 'add_to_inventory':
      return `${indent}addToInventory("${node.item}", ${node.quantity});\n`;
    case 'remove_from_inventory':
      return `${indent}removeFromInventory("${node.item}", ${node.quantity});\n`;

    // === Cutscene ===
    case 'trigger_cutscene':
      return `${indent}triggerCutscene("${node.name}");\n`;
    case 'fade_in':
      return `${indent}fadeIn(${node.duration});\n`;
    case 'fade_out':
      return `${indent}fadeOut(${node.duration});\n`;

    // === Boss ===
    case 'spawn_boss':
      return `${indent}spawnBoss("${node.name}", ${node.health});\n`;
    case 'set_boss_health':
      return `${indent}setBossHealth(${node.health});\n`;
    case 'boss_attack':
      return `${indent}bossAttack("${node.pattern}");\n`;
    case 'boss_phase':
      return `${indent}bossPhase(${node.phase});\n`;

    // === Advanced Movement ===
    case 'dash':
      return `${indent}dash(${node.force});\n`;
    case 'double_jump':
      return `${indent}doubleJump(${node.enabled});\n`;
    case 'wall_jump':
      return `${indent}wallJump(${node.enabled});\n`;
    case 'grapple':
      return `${indent}grapple(${node.force});\n`;

    // === Checkpoints ===
    case 'create_checkpoint':
      return `${indent}createCheckpoint("${node.name}");\n`;
    case 'load_checkpoint':
      return `${indent}loadCheckpoint();\n`;

    // === Dialogue ===
    case 'create_dialogue':
      return `${indent}createDialogue("${node.speaker}", "${node.message}");\n`;
    case 'end_dialogue':
      return `${indent}endDialogue();\n`;
    case 'npc_talk':
      return `${indent}npcTalk("${node.name}", "${node.message}");\n`;

    // === Game Objects ===
    case 'shoot':
      return `${indent}shoot("${node.emoji}");\n`;
    case 'add_platform':
      return `${indent}addPlatform(${node.x}, ${node.y}, ${node.width});\n`;
    case 'create_clone':
      return `${indent}createClone();\n`;
    case 'delete_clone':
      return `${indent}deleteClone();\n`;

    // === Weather ===
    case 'set_weather':
      return `${indent}setWeather("${node.weather}");\n`;

    // === Sports ===
    case 'kick_ball':
      return `${indent}kickBall("${node.emoji}", ${node.force});\n`;
    case 'pass_ball':
      return `${indent}passBall("${node.target}");\n`;
    case 'dribble':
      return `${indent}dribble(${node.speed});\n`;
    case 'shoot_ball':
      return `${indent}shootBall("${node.emoji}", ${node.force});\n`;
    case 'set_timer':
      return `${indent}setMatchTimer(${node.seconds});\n`;
    case 'tick_timer':
      return `${indent}tickTimer();\n`;
    case 'stop_timer':
      return `${indent}stopTimer();\n`;
    case 'score_goal':
      return `${indent}scoreGoal(${node.points});\n`;
    case 'add_period':
      return `${indent}addPeriod("${node.name}");\n`;
    case 'end_period':
      return `${indent}endPeriod();\n`;
    case 'spawn_ball':
      return `${indent}spawnBall("${node.emoji}");\n`;
    case 'spawn_teammate':
      return `${indent}spawnTeammate("${node.emoji}");\n`;
    case 'spawn_opponent':
      return `${indent}spawnOpponent("${node.emoji}");\n`;
    case 'switch_control':
      return `${indent}switchControl();\n`;
    case 'set_formation':
      return `${indent}setFormation("${node.formation}");\n`;
    case 'foul':
      return `${indent}triggerFoul("${node.type}");\n`;
    case 'yellow_card':
      return `${indent}issueYellowCard();\n`;
    case 'red_card':
      return `${indent}issueRedCard();\n`;

    // === Advanced Sports ===
    case 'cry_foul':
      return `${indent}cryFoul("${node.text}");\n`;
    case 'celebrate_goal':
      return `${indent}celebrateGoal("${node.text}");\n`;
    case 'substitution':
      return `${indent}substitution("${node.player}");\n`;
    case 'extra_time':
      return `${indent}extraTime(${node.seconds});\n`;
    case 'penalty_kick':
      return `${indent}penaltyKick(${node.force});\n`;
    case 'corner_kick':
      return `${indent}cornerKick();\n`;
    case 'free_kick':
      return `${indent}freeKick(${node.force});\n`;
    case 'injury_time':
      return `${indent}injuryTime(${node.seconds});\n`;
    case 'water_break':
      return `${indent}waterBreak();\n`;
    case 'team_talk':
      return `${indent}teamTalk("${node.message}");\n`;
    case 'set_piece':
      return `${indent}setPiece("${node.type}");\n`;
    case 'man_mark':
      return `${indent}manMark();\n`;

    // === Action ===
    case 'swing_weapon':
      return `${indent}swingWeapon("${node.weapon}", ${node.damage});\n`;
    case 'combo_attack':
      return `${indent}comboAttack(${node.hits});\n`;
    case 'dodge_roll':
      return `${indent}dodgeRoll(${node.distance});\n`;
    case 'block_attack':
      return `${indent}blockAttack();\n`;
    case 'special_move':
      return `${indent}specialMove("${node.name}", ${node.damage});\n`;
    case 'switch_weapon':
      return `${indent}switchWeapon("${node.weapon}");\n`;
    case 'charge_attack':
      return `${indent}chargeAttack(${node.damage});\n`;

    // === Adventure ===
    case 'examine':
      return `${indent}examine("${node.target}");\n`;
    case 'use_item':
      return `${indent}useItem("${node.item}");\n`;
    case 'combine_items':
      return `${indent}combineItems("${node.item1}", "${node.item2}");\n`;
    case 'talk_to':
      return `${indent}talkTo("${node.npc}");\n`;
    case 'add_quest':
      return `${indent}addQuest("${node.name}");\n`;
    case 'complete_quest':
      return `${indent}completeQuest("${node.name}");\n`;
    case 'discover':
      return `${indent}discover("${node.location}");\n`;
    case 'trigger_puzzle':
      return `${indent}triggerPuzzle("${node.type}");\n`;

    // === Shooter ===
    case 'reload':
      return `${indent}reload();\n`;
    case 'throw_grenade':
      return `${indent}throwGrenade(${node.force});\n`;
    case 'take_cover':
      return `${indent}takeCover();\n`;
    case 'aim':
      return `${indent}aim(${node.zoom});\n`;
    case 'swap_weapon':
      return `${indent}swapWeapon("${node.weapon}");\n`;
    case 'drop_weapon':
      return `${indent}dropWeapon();\n`;
    case 'pickup_weapon':
      return `${indent}pickupWeapon("${node.weapon}");\n`;

    // === Survival ===
    case 'gather':
      return `${indent}gather("${node.resource}", ${node.amount});\n`;
    case 'craft':
      return `${indent}craft("${node.item}", ${node.cost});\n`;
    case 'eat':
      return `${indent}eat(${node.amount});\n`;
    case 'drink':
      return `${indent}drink(${node.amount});\n`;
    case 'build':
      return `${indent}build("${node.structure}", ${node.cost});\n`;
    case 'place_torch':
      return `${indent}placeTorch();\n`;
    case 'shelter':
      return `${indent}shelter(${node.level});\n`;

    // === Puzzle ===
    case 'swap_tiles':
      return `${indent}swapTiles();\n`;
    case 'rotate_block':
      return `${indent}rotateBlock(${node.degrees});\n`;
    case 'slide_puzzle':
      return `${indent}slidePuzzle("${node.direction}");\n`;
    case 'fill_color':
      return `${indent}fillColor("${node.color}");\n`;
    case 'connect_dots':
      return `${indent}connectDots(${node.pairs});\n`;
    case 'sort_items':
      return `${indent}sortItems("${node.by}");\n`;
    case 'unlock_pattern':
      return `${indent}unlockPattern("${node.pattern}");\n`;
    case 'mirror_puzzle':
      return `${indent}mirrorPuzzle("${node.axis}");\n`;
    case 'flip_card':
      return `${indent}flipCard();\n`;
    case 'check_match':
      return `${indent}checkMatch();\n`;

    // === Racing ===
    case 'boost':
      return `${indent}boost(${node.force});\n`;
    case 'drift':
      return `${indent}drift(${node.angle});\n`;
    case 'lap_complete':
      return `${indent}lapComplete();\n`;
    case 'start_race':
      return `${indent}startRace(${node.countdown});\n`;
    case 'set_checkpoint':
      return `${indent}setCheckpoint();\n`;
    case 'upgrade_car':
      return `${indent}upgradeCar("${node.stat}", ${node.amount});\n`;
    case 'pit_stop':
      return `${indent}pitStop();\n`;
    case 'use_boost_pad':
      return `${indent}useBoostPad();\n`;

    // === Movement Extras ===
    case 'go_to_xy':
      return `${indent}sprite.x = ${node.x}; sprite.y = ${node.y};\n`;
    case 'turn_right':
      return `${indent}sprite.rotation += ${node.degrees};\n`;
    case 'turn_left':
      return `${indent}sprite.rotation -= ${node.degrees};\n`;

    // === 3D ===
    case 'move_z':
      return `${indent}sprite.z += ${node.dz};\n`;
    case 'rotate_x':
      return `${indent}sprite.rotationX += ${node.degrees};\n`;
    case 'rotate_y':
      return `${indent}sprite.rotationY += ${node.degrees};\n`;
    case 'rotate_z':
      return `${indent}sprite.rotationZ += ${node.degrees};\n`;

    // === Advanced Platformer Extras ===
    case 'wall_jump_enabled':
      return `${indent}wallJumpEnabled(${node.enabled});\n`;
    case 'ceiling_cling':
      return `${indent}ceilingCling();\n`;
    case 'air_dash':
      return `${indent}airDash(${node.force});\n`;
    case 'ground_slam':
      return `${indent}groundSlam(${node.force});\n`;
    case 'climb_vine':
      return `${indent}climbVine(${node.force});\n`;
    case 'swing_rope':
      return `${indent}swingRope(${node.force});\n`;

    // === Misc ===
    case 'set_scene':
      return `${indent}setScene("${node.scene}");\n`;
    case 'set_music_volume':
      return `${indent}setMusicVolume(${node.volume});\n`;
    case 'play_ambient':
      return `${indent}playAmbient("${node.preset}");\n`;
    case 'slow_motion':
      return `${indent}setTimeScale(${node.timeScale});\n`;
    case 'play_animation':
      return `${indent}sprite.playAnimation("${node.animation}");\n`;
    case 'broadcast':
      return `${indent}broadcast("${node.channel}");\n`;
    case 'log_data':
      return `${indent}console.log("${node.text}");\n`;
    case 'wait':
      return `${indent}await wait(${node.seconds * 1000});\n`;

    // === Save/Load ===
    case 'save_game':
      return `${indent}saveGame("${node.slot}");\n`;
    case 'load_game':
      return `${indent}loadGame("${node.slot}");\n`;

    // === Data ===
    case 'set_var':
      return `${indent}variables["${node.varName}"] = ${JSON.stringify(node.value)};\n`;
    case 'change_var':
      return `${indent}variables["${node.varName}"] += ${node.delta};\n`;

    default:
      return null;
  }
}
