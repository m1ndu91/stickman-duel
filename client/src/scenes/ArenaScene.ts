import Phaser from "phaser";
import type { Room } from "@colyseus/sdk";
import type { InputMessage } from "@stickman/shared";
import { GameWorld, PLATFORMS, type Fighter } from "@stickman/shared/physics";
import { joinDuel, type DuelStateView } from "../net";
import { drawStickman } from "../stickman";

const ME = 0x4fc3f7;
const OPPONENT = 0xff7043;

/**
 * 서버에 접속되면 서버가 계산한 위치를 그리고(온라인),
 * 접속이 안 되면 같은 물리 코드를 브라우저에서 직접 돌린다(오프라인 연습).
 */
export class ArenaScene extends Phaser.Scene {
  private keys!: Record<"left" | "right" | "jump", Phaser.Input.Keyboard.Key>;
  private gfx!: Phaser.GameObjects.Graphics;
  private label!: Phaser.GameObjects.Text;

  private room: Room<any, DuelStateView> | null = null;
  private local: { world: GameWorld; me: Fighter } | null = null;
  private accumulator = 0;

  constructor() {
    super("arena");
  }

  async create() {
    const kb = this.input.keyboard!;
    this.keys = {
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      jump: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    };

    const terrain = this.add.graphics();
    terrain.fillStyle(0x5c6370);
    for (const p of PLATFORMS) terrain.fillRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h);

    this.gfx = this.add.graphics();
    this.label = this.add.text(16, 16, "서버 접속 중...", { fontSize: "18px", color: "#ddd" });

    this.room = await joinDuel();
    if (this.room) {
      this.label.setText("온라인 대전 (A/D 이동, W 점프) · 상대를 기다리는 중");
      this.room.onLeave(() => this.label.setText("서버와 연결이 끊겼습니다"));
    } else {
      const world = new GameWorld();
      this.local = { world, me: world.addFighter(400) };
      this.label.setText("오프라인 연습 모드 (A/D 이동, W 점프) · 서버를 켜면 온라인으로 접속");
    }
  }

  update(_time: number, deltaMs: number) {
    if (!this.keys) return;
    const input: InputMessage = {
      left: this.keys.left.isDown,
      right: this.keys.right.isDown,
      jump: this.keys.jump.isDown,
    };
    this.gfx.clear();

    if (this.room) {
      this.room.send("input", input);
      const players = this.room.state.players;
      if (!players) return;
      if (players.size === 2) this.label.setText("온라인 대전 (A/D 이동, W 점프) · 2인 접속");
      players.forEach((p, id) => drawStickman(this.gfx, p.x, p.y, id === this.room!.sessionId ? ME : OPPONENT));
    } else if (this.local) {
      // 렌더 프레임과 상관없이 물리는 고정 1/60초 간격으로 진행
      const { world, me } = this.local;
      this.accumulator += deltaMs / 1000;
      while (this.accumulator >= world.world.timestep) {
        me.applyInput(input);
        world.step();
        this.accumulator -= world.world.timestep;
      }
      drawStickman(this.gfx, me.position.x, me.position.y, ME);
    }
  }
}
