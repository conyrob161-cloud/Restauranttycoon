export default class CameraController {
  constructor(config, events) {
    this.config = config;
    this.events = events;
    this.anchor = null;
    this.player = null;
    this.cameraEntity = null;
    this.targetPosition = new pc.Vec3();
    this.followPosition = new pc.Vec3();
  }

  attach(cameraEntity, player) {
    this.cameraEntity = cameraEntity;
    this.player = player;
    this.followPosition.copy(cameraEntity.getPosition());
  }

  update(dt, player) {
    if (!this.cameraEntity || !player) return;
    this.targetPosition.copy(player.getPosition());
    this.targetPosition.add(new pc.Vec3(8, 7, 8));
    this.followPosition.lerp(this.followPosition, this.targetPosition, Math.min(1, dt * this.config.camera.smoothness));
    this.cameraEntity.setPosition(this.followPosition);
    this.cameraEntity.lookAt(player.getPosition());
  }

  syncVisuals() {}
}
