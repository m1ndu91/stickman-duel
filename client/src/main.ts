import Phaser from "phaser";
import { ARENA } from "@stickman/shared";
import { initPhysics } from "@stickman/shared/physics";
import { ArenaScene } from "./scenes/ArenaScene";

await initPhysics();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: ARENA.width,
  height: ARENA.height,
  backgroundColor: "#1d1f24",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [ArenaScene],
});
