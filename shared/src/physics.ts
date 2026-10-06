// 클라이언트(오프라인 연습)와 서버(온라인 대전)가 똑같이 쓰는 물리 시뮬레이션.
// 결정론적 Rapier 빌드를 써서 같은 입력이면 어느 기기에서든 같은 결과가 나온다.
import RAPIER from "@dimforge/rapier2d-deterministic-compat";
import { ARENA, PIXELS_PER_METER, TICK_RATE, type InputMessage } from "./index";

export { RAPIER };

const PLAYER_HALF = { w: 0.3, h: 0.9 }; // 미터
const MOVE_SPEED = 6; // m/s
const JUMP_SPEED = 9; // m/s

let ready: Promise<void> | null = null;

/** Rapier WASM 초기화. 월드를 만들기 전에 한 번 await 해야 한다. */
export function initPhysics(): Promise<void> {
  ready ??= RAPIER.init();
  return ready;
}

export const toPx = (m: number) => m * PIXELS_PER_METER;
const toM = (px: number) => px / PIXELS_PER_METER;

export interface Platform {
  /** 픽셀 단위 중심 좌표와 크기 (렌더링에도 그대로 씀) */
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 기본 아레나: 바닥 + 발판 두 개. 지형 인터랙션은 여기서부터 늘려가면 된다. */
export const PLATFORMS: Platform[] = [
  { x: ARENA.width / 2, y: ARENA.height - 40, w: 1000, h: 40 },
  { x: 380, y: 480, w: 220, h: 20 },
  { x: 900, y: 480, w: 220, h: 20 },
];

export class Fighter {
  constructor(
    readonly body: RAPIER.RigidBody,
    private readonly world: GameWorld,
  ) {}

  /** 픽셀 단위 위치 */
  get position() {
    const t = this.body.translation();
    return { x: toPx(t.x), y: toPx(t.y) };
  }

  applyInput(input: InputMessage) {
    const v = this.body.linvel();
    let vx = 0;
    if (input.left) vx -= MOVE_SPEED;
    if (input.right) vx += MOVE_SPEED;
    let vy = v.y;
    if (input.jump && this.world.isGrounded(this)) vy = -JUMP_SPEED;
    this.body.setLinvel({ x: vx, y: vy }, true);
  }
}

export class GameWorld {
  readonly world: RAPIER.World;

  constructor() {
    // 화면 좌표처럼 y가 아래로 갈수록 커지므로 중력도 +y
    this.world = new RAPIER.World({ x: 0, y: 20 });
    this.world.timestep = 1 / TICK_RATE;
    for (const p of PLATFORMS) {
      const body = this.world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(toM(p.x), toM(p.y)),
      );
      this.world.createCollider(RAPIER.ColliderDesc.cuboid(toM(p.w / 2), toM(p.h / 2)), body);
    }
  }

  /** spawnX는 픽셀 단위 */
  addFighter(spawnX: number): Fighter {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(toM(spawnX), 2)
        .lockRotations(),
    );
    this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(PLAYER_HALF.w, PLAYER_HALF.h).setFriction(0),
      body,
    );
    return new Fighter(body, this);
  }

  removeFighter(f: Fighter) {
    this.world.removeRigidBody(f.body);
  }

  isGrounded(f: Fighter): boolean {
    const t = f.body.translation();
    const ray = new RAPIER.Ray({ x: t.x, y: t.y }, { x: 0, y: 1 });
    const hit = this.world.castRay(ray, PLAYER_HALF.h + 0.05, true, undefined, undefined, undefined, f.body);
    return hit !== null;
  }

  step() {
    this.world.step();
  }
}
