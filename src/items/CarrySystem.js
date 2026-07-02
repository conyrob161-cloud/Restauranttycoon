export default class CarrySystem {
  constructor(events) {
    this.events = events;
    this.player = null;
    this.heldItem = null;
    this.holdOffset = new pc.Vec3(0, 1.25, 0.45);
  }

  registerPlayer(player) {
    this.player = player;
  }

  pickup(item) {
    if (!item) return;
    this.heldItem = item;
    item.setLocalScale(0.7, 0.7, 0.7);
    item.enabled = false;
    this.events.emit('item:picked', { item });
  }

  drop() {
    if (!this.heldItem || !this.player) return;
    const item = this.heldItem;
    item.setPosition(this.player.getPosition().clone().add(this.holdOffset));
    item.enabled = true;
    this.heldItem = null;
    this.events.emit('item:dropped', { item });
  }

  update(dt, player) {
    if (!this.heldItem || !player) return;
    const pos = player.getPosition().clone().add(this.holdOffset);
    this.heldItem.setPosition(pos);
  }

  restore(state, scene) {
    if (!state || !scene || !scene.pickupItem) return;
    if (state.held) {
      this.pickup(scene.pickupItem);
    }
  }
}
