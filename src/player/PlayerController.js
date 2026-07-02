import CharacterMotor from './CharacterMotor.js';

export default class PlayerController {
  constructor(config, physics, interactions, carry, events) {
    this.config = config;
    this.physics = physics;
    this.interactions = interactions;
    this.carry = carry;
    this.events = events;
    this.entity = null;
    this.visual = null;
    this.motor = new CharacterMotor(config, physics);
    this.input = { move: new pc.Vec2(), run: false };
  }

  spawn(entity) {
    this.entity = entity;
    this.motor.setPosition(entity.getPosition());
    this.interactions.registerPlayer(this);
    this.carry.registerPlayer(this);
  }

  update(dt, inputState) {
    this.input.move.copy(inputState.move);
    this.input.run = inputState.run;
    this.motor.move(this.input.move, this.input.run, dt);
    this.entity.setPosition(this.motor.getPosition());
    if (this.input.move.lengthSq() > 0.0001) {
      const angle = Math.atan2(this.input.move.x, this.input.move.y) * pc.math.RAD_TO_DEG;
      this.entity.setEulerAngles(0, angle, 0);
    }
    if (inputState.interact) {
      this.interactions.interactNearest(this);
    }
    if (inputState.drop) {
      this.carry.drop();
    }
  }

  getPosition() {
    return this.entity ? this.entity.getPosition() : this.motor.getPosition();
  }

  restore(state) {
    if (!state) return;
    this.entity.setPosition(state.position.x, state.position.y, state.position.z);
    this.motor.setPosition(this.entity.getPosition());
  }

  syncVisuals() {}
}
