export default class SceneBuilder {
  constructor(app, config, events) {
    this.app = app;
    this.config = config;
    this.events = events;
    this.playerSpawn = null;
    this.cameraAnchor = null;
    this.npcSpawn = null;
    this.pickupItem = null;
    this.interactionSpot = null;
    this.saveTrigger = null;
    this.staticBodies = [];
    this.interactables = [];
  }

  createMaterial(color) {
    const material = new pc.StandardMaterial();
    material.diffuse = color;
    material.update();
    return material;
  }

  createBox(name, scale, position, color, staticBody = true) {
    const entity = new pc.Entity(name);
    entity.addComponent('render', { type: 'box' });
    entity.render.material = this.createMaterial(color);
    entity.setLocalScale(scale.x, scale.y, scale.z);
    entity.setPosition(position.x, position.y, position.z);
    if (staticBody) {
      entity.addComponent('collision', { type: 'box', halfExtents: new pc.Vec3(scale.x / 2, scale.y / 2, scale.z / 2) });
      entity.addComponent('rigidbody', { type: 'static' });
      this.staticBodies.push({ entity, size: scale });
    }
    this.app.root.addChild(entity);
    return entity;
  }

  createSphere(name, scale, position, color, staticBody = false) {
    const entity = new pc.Entity(name);
    entity.addComponent('render', { type: 'sphere' });
    entity.render.material = this.createMaterial(color);
    entity.setLocalScale(scale.x, scale.y, scale.z);
    entity.setPosition(position.x, position.y, position.z);
    if (staticBody) {
      entity.addComponent('collision', { type: 'sphere', radius: scale.x / 2 });
      entity.addComponent('rigidbody', { type: 'static' });
      this.staticBodies.push({ entity, size: scale });
    }
    this.app.root.addChild(entity);
    return entity;
  }

  addInteractable(entity, range, priority, prompt, onInteract) {
    entity.getInteractionPosition = () => entity.getPosition();
    entity.getInteractionRange = () => range;
    entity.getInteractionPriority = () => priority;
    entity.getPrompt = () => prompt;
    entity.canInteract = () => true;
    entity.interact = onInteract;
    this.interactables.push(entity);
    return entity;
  }

  build() {
    const ambient = new pc.Entity('AmbientLight');
    ambient.addComponent('light', {
      type: 'directional',
      intensity: 1.2,
      color: new pc.Color(1, 1, 1),
      castShadows: true
    });
    ambient.setEulerAngles(45, 45, 0);
    this.app.root.addChild(ambient);

    const camera = new pc.Entity('Camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.48, 0.72, 0.95),
      farClip: 250
    });
    camera.setPosition(8, 7, 8);
    camera.lookAt(0, 0, 0);
    this.app.root.addChild(camera);
    this.cameraAnchor = camera;

    this.createBox('Floor', { x: 20, y: 0.2, z: 20 }, { x: 0, y: -0.1, z: 0 }, new pc.Color(0.82, 0.83, 0.78));
    this.createBox('WallNorth', { x: 20, y: 2, z: 0.5 }, { x: 0, y: 1, z: -10 }, new pc.Color(0.35, 0.35, 0.4));
    this.createBox('WallSouth', { x: 20, y: 2, z: 0.5 }, { x: 0, y: 1, z: 10 }, new pc.Color(0.35, 0.35, 0.4));
    this.createBox('WallWest', { x: 0.5, y: 2, z: 20 }, { x: -10, y: 1, z: 0 }, new pc.Color(0.35, 0.35, 0.4));
    this.createBox('WallEast', { x: 0.5, y: 2, z: 20 }, { x: 10, y: 1, z: 0 }, new pc.Color(0.35, 0.35, 0.4));
    this.createBox('Counter1', { x: 2, y: 1, z: 1 }, { x: -3, y: 0.5, z: -1 }, new pc.Color(0.72, 0.44, 0.26));
    this.createBox('Counter2', { x: 2, y: 1, z: 1 }, { x: 3, y: 0.5, z: 2 }, new pc.Color(0.72, 0.44, 0.26));

    const player = new pc.Entity('Player');
    player.addComponent('render', { type: 'capsule' });
    player.render.material = this.createMaterial(new pc.Color(0.2, 0.75, 0.95));
    player.setPosition(0, 1, 0);
    this.app.root.addChild(player);
    this.playerSpawn = player;

    const npc = new pc.Entity('NPC');
    npc.addComponent('render', { type: 'capsule' });
    npc.render.material = this.createMaterial(new pc.Color(0.95, 0.72, 0.15));
    npc.setPosition(-6, 1, -6);
    this.app.root.addChild(npc);
    this.npcSpawn = npc;

    const item = this.createBox('PickupBox', { x: 0.7, y: 0.7, z: 0.7 }, { x: 2, y: 0.35, z: -2 }, new pc.Color(0.94, 0.55, 0.2), false);
    item._carried = false;
    this.addInteractable(item, 1.5, 10, 'Pick up box', (playerController) => {
      if (!item._carried) {
        item._carried = true;
        playerController.carry.pickup(item);
      }
    });
    this.pickupItem = item;

    const interactionSpot = this.createSphere('InteractionSpot', { x: 0.35, y: 0.35, z: 0.35 }, { x: -5, y: 0.35, z: 3 }, new pc.Color(0.35, 0.9, 0.45), false);
    this.addInteractable(interactionSpot, 2, 1, 'Test interaction', () => {
      this.events.emit('interaction:spot', { name: interactionSpot.name });
    });
    this.interactionSpot = interactionSpot;

    const saveTrigger = this.createBox('SaveTrigger', { x: 1, y: 0.1, z: 1 }, { x: 5, y: 0.05, z: 5 }, new pc.Color(0.35, 0.35, 0.95), false);
    this.addInteractable(saveTrigger, 2, 100, 'Save game', () => {
      this.events.emit('game:save-request');
    });
    this.saveTrigger = saveTrigger;
  }
}
