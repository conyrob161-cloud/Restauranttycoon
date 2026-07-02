export default class Item {
  constructor(entity, options = {}) {
    this.entity = entity;
    this.name = options.name || entity.name;
    this.carryable = options.carryable !== false;
    this.held = false;
  }
}
