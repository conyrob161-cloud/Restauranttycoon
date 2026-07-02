export default class CharacterMotor {
  constructor(config, physics) {
    this.config = config;
    this.physics = physics;
    this.position = new pc.Vec3();
    this.velocity = new pc.Vec3();
    this.radius = config.player.radius;
  }

  setPosition(position) {
    this.position.copy(position);
  }

  getPosition() {
    return this.position;
  }

  move(direction, running, dt) {
    const targetSpeed = running ? this.config.player.runSpeed : this.config.player.walkSpeed;
    const desired = new pc.Vec3(direction.x, 0, direction.y);
    if (desired.lengthSq() > 1) desired.normalize();
    desired.scale(targetSpeed);

    const lerpAmount = Math.min(1, (desired.length() > 0 ? this.config.player.acceleration : this.config.player.deceleration) * dt);
    this.velocity.lerp(this.velocity, desired, lerpAmount);

    const next = this.position.clone();
    next.x += this.velocity.x * dt;
    next.z += this.velocity.z * dt;

    const resolved = this.physics.resolve(next, this.radius, this.position);
    this.position.copy(resolved);

    if (this.velocity.lengthSq() > 0.0001) {
      const angle = Math.atan2(this.velocity.x, this.velocity.z) * pc.math.RAD_TO_DEG;
      this.facing = angle;
    }
  }
}
