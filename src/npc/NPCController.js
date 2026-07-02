import CharacterMotor from '../player/CharacterMotor.js';
import NavigationAgent from '../navigation/NavigationAgent.js';

export default class NPCController {
  constructor(config, physics, navigation, events) {
    this.config = config;
    this.physics = physics;
    this.navigation = navigation;
    this.events = events;
    this.entity = null;
    this.motor = new CharacterMotor(config, physics);
    this.agent = new NavigationAgent();
    this.route = [];
    this.routeIndex = 0;
    this.patrolPoints = [new pc.Vec3(-6, 1, -6), new pc.Vec3(6, 1, -6), new pc.Vec3(6, 1, 6), new pc.Vec3(-6, 1, 6)];
    this.currentPatrol = 0;
  }

  spawn(entity) {
    this.entity = entity;
    this.motor.setPosition(entity.getPosition());
    this.navigation.registerNPC(this);
    this.repath();
  }

  repath() {
    const start = this.motor.getPosition().clone();
    const goal = this.patrolPoints[this.currentPatrol].clone();
    this.route = this.navigation.pathfinder.findPath(start, goal);
    this.routeIndex = 0;
  }

  update(dt) {
    if (!this.entity) return;
    const target = this.route[this.routeIndex];
    if (!target) {
      this.currentPatrol = (this.currentPatrol + 1) % this.patrolPoints.length;
      this.repath();
      return;
    }
    const current = this.motor.getPosition();
    const dx = target.x - current.x;
    const dz = target.z - current.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.3) {
      this.routeIndex++;
      if (this.routeIndex >= this.route.length) {
        this.currentPatrol = (this.currentPatrol + 1) % this.patrolPoints.length;
        this.repath();
      }
      return;
    }
    this.motor.move(new pc.Vec2(dx, dz), false, dt);
    this.entity.setPosition(this.motor.getPosition());
    this.entity.setEulerAngles(0, Math.atan2(dx, dz) * pc.math.RAD_TO_DEG, 0);
  }

  updateNavigation(dt) {
    this.update(dt);
  }

  restore(state) {
    if (!state) return;
    this.entity.setPosition(state.position.x, state.position.y, state.position.z);
    this.motor.setPosition(this.entity.getPosition());
  }

  syncVisuals() {}
}
