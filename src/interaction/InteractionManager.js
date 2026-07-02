export default class InteractionManager {
  constructor(events) {
    this.events = events;
    this.player = null;
    this.targets = [];
    this.currentTarget = null;
  }

  registerPlayer(player) {
    this.player = player;
  }

  register(target) {
    this.targets.push(target);
  }

  update(dt) {
    if (!this.player) return;
    const playerPos = this.player.getPosition();
    let best = null;
    let bestDistance = Infinity;
    for (const target of this.targets) {
      if (!target || !target.canInteract || !target.canInteract(this.player)) continue;
      const distance = target.getInteractionPosition().distance(playerPos);
      if (distance < target.getInteractionRange() && distance < bestDistance) {
        best = target;
        bestDistance = distance;
      }
    }
    this.currentTarget = best;
  }

  interactNearest(player) {
    if (this.currentTarget && this.currentTarget.interact) {
      this.currentTarget.interact(player);
      this.events.emit('interaction:completed', { target: this.currentTarget });
    }
  }
}
