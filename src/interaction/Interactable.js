export default class Interactable {
  constructor(entity, options = {}) {
    this.entity = entity;
    this.prompt = options.prompt || 'Interact';
    this.range = options.range || 1.5;
    this.priority = options.priority || 0;
    this.onInteract = options.onInteract || (() => {});
  }

  canInteract() {
    return true;
  }

  interact(player) {
    this.onInteract(player);
  }

  getPrompt() {
    return this.prompt;
  }

  getInteractionPosition() {
    return this.entity.getPosition();
  }

  getInteractionRange() {
    return this.range;
  }

  getInteractionPriority() {
    return this.priority;
  }
}
