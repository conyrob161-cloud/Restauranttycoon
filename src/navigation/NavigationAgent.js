export default class NavigationAgent {
  constructor() {
    this.destination = new pc.Vec3();
    this.path = [];
    this.index = 0;
  }

  setDestination(destination) {
    this.destination.copy(destination);
    this.index = 0;
  }
}
