export default class SaveManager {
  constructor(config, events) {
    this.config = config;
    this.events = events;
    this.player = null;
    this.npc = null;
    this.carry = null;
    this.scene = null;
    this.timer = 0;
    this.autoSaveSeconds = 30;
  }

  attach(player, npc, carry, scene) {
    this.player = player;
    this.npc = npc;
    this.carry = carry;
    this.scene = scene;
  }

  buildState() {
    return {
      version: 1,
      player: {
        position: this.player.getPosition()
      },
      npc: {
        position: this.npc.entity.getPosition()
      },
      carry: {
        held: !!this.carry.heldItem
      }
    };
  }

  save() {
    const state = this.buildState();
    localStorage.setItem(this.config.saveKey, JSON.stringify(state));
    this.events.emit('save:completed', state);
    return state;
  }

  load() {
    const raw = localStorage.getItem(this.config.saveKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error('Failed to load save:', error);
      return null;
    }
  }

  sync(dt) {
    this.timer += dt;
    if (this.timer >= this.autoSaveSeconds) {
      this.timer = 0;
      this.save();
    }
  }
}
