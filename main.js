import Engine from './src/core/Engine.js';

const engine = new Engine({
  canvasId: 'application'
});

engine.initialize();
engine.start();
