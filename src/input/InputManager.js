import KeyboardInput from './KeyboardInput.js';
import VirtualJoystick from './VirtualJoystick.js';

export default class InputManager {
  constructor(config, app, events) {
    this.config = config;
    this.app = app;
    this.events = events;
    this.keyboard = new KeyboardInput(app);
    this.joystick = new VirtualJoystick(config, events);
    this.state = {
      move: new pc.Vec2(0, 0),
      run: false,
      interact: false,
      drop: false,
      pausePressed: false
    };
  }

  update() {
    const keyboardMove = this.keyboard.getMove();
    const joystickMove = this.joystick.getMove();
    const move = keyboardMove.lengthSq() > joystickMove.lengthSq() ? keyboardMove : joystickMove;

    this.state.move.set(move.x, move.y);
    this.state.run = this.keyboard.isRunPressed() || this.joystick.isRunPressed();
    this.state.interact = this.keyboard.isInteractPressed() || this.joystick.consumeInteract();
    this.state.drop = this.keyboard.isDropPressed();
    this.state.pausePressed = this.keyboard.consumePause();
  }
}
