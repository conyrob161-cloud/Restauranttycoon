export default class DebugOverlay {
  constructor(config, events) {
    this.config = config;
    this.events = events;
    this.element = document.createElement('div');
    this.element.className = 'rt-debug';
    this.element.style.display = 'block';
    document.body.appendChild(this.element);
    this.player = null;
    this.npc = null;
    this.physics = null;
    this.navigation = null;
    this.interactions = null;
    this.save = null;
  }

  attach(player, npc, physics, navigation, interactions, save) {
    this.player = player;
    this.npc = npc;
    this.physics = physics;
    this.navigation = navigation;
    this.interactions = interactions;
    this.save = save;
  }

  update() {}

  render() {
    const playerPos = this.player ? this.player.getPosition() : new pc.Vec3();
    const npcPos = this.npc ? this.npc.entity.getPosition() : new pc.Vec3();
    this.element.textContent = [
      `Player: ${playerPos.x.toFixed(2)}, ${playerPos.z.toFixed(2)}`,
      `NPC: ${npcPos.x.toFixed(2)}, ${npcPos.z.toFixed(2)}`,
      `Colliders: ${this.physics ? this.physics.colliders.length : 0}`,
      `Interaction target: ${this.interactions && this.interactions.currentTarget ? this.interactions.currentTarget.name : 'none'}`,
      `Saved: ${localStorage.getItem(this.config.saveKey) ? 'yes' : 'no'}`
    ].join('\n');
  }
}
