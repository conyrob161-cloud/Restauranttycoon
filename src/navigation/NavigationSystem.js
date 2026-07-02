import Pathfinder from './Pathfinder.js';

export default class NavigationSystem {
  constructor(config, physics, events) {
    this.config = config;
    this.physics = physics;
    this.events = events;
    this.pathfinder = new Pathfinder(config, physics);
    this.npcs = [];
  }

  registerNPC(npc) {
    this.npcs.push(npc);
  }

  update() {
    for (const npc of this.npcs) {
      if (typeof npc.updateNavigation === 'function') {
        npc.updateNavigation(0, this.pathfinder);
      }
    }
  }
}
