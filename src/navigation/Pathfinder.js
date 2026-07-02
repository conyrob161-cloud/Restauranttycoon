export default class Pathfinder {
  constructor(config, physics) {
    this.config = config;
    this.physics = physics;
  }

  findPath(start, goal) {
    return [start.clone(), goal.clone()];
  }
}
