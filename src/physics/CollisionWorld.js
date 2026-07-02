export default class CollisionWorld {
  constructor(config, events) {
    this.config = config;
    this.events = events;
    this.colliders = [];
  }

  register(entity, size, isTrigger = false) {
    this.colliders.push({ entity, size, isTrigger });
  }

  resolve(nextPosition, radius, previousPosition) {
    const result = nextPosition.clone();
    const half = radius;
    for (const collider of this.colliders) {
      if (collider.isTrigger) continue;
      const pos = collider.entity.getPosition();
      const sx = collider.size.x / 2 + half;
      const sz = collider.size.z / 2 + half;
      const minX = pos.x - sx;
      const maxX = pos.x + sx;
      const minZ = pos.z - sz;
      const maxZ = pos.z + sz;
      if (result.x > minX && result.x < maxX && result.z > minZ && result.z < maxZ) {
        const left = Math.abs(result.x - minX);
        const right = Math.abs(maxX - result.x);
        const bottom = Math.abs(result.z - minZ);
        const top = Math.abs(maxZ - result.z);
        const min = Math.min(left, right, bottom, top);
        if (min === left) result.x = minX;
        else if (min === right) result.x = maxX;
        else if (min === bottom) result.z = minZ;
        else result.z = maxZ;
      }
    }
    return result;
  }
}
