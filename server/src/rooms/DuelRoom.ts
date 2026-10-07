import { Room, type Client } from "@colyseus/core";
import { ARENA, TICK_RATE, type InputMessage } from "@stickman/shared";
import { GameWorld, type Fighter } from "@stickman/shared/physics";
import { DuelState, PlayerState } from "../state.js";

const STEP_MS = 1000 / TICK_RATE;
/** 서버가 잠깐 멈췄을 때 한 번에 따라잡을 최대 스텝 수 (넘는 시간은 버린다) */
const MAX_CATCH_UP_STEPS = 5;

/** 1대1 대전 방. 서버가 물리를 직접 돌리는 서버 권한(authoritative) 구조. */
export class DuelRoom extends Room<{ state: DuelState }> {
  maxClients = 2;
  state = new DuelState();

  private world = new GameWorld();
  private fighters = new Map<string, Fighter>();
  private latestInputs = new Map<string, InputMessage>();
  private accumulatorMs = 0;

  onCreate() {
    this.onMessage("input", (client, input: InputMessage) => {
      this.latestInputs.set(client.sessionId, input);
    });
    // Windows 타이머는 약 15ms 단위라 16.7ms 간격을 주면 30ms마다 돈다.
    // 그래서 타이머는 짧게 자주 깨우고, 실제 흐른 시간만큼 1/60초 스텝을 돌린다.
    this.setSimulationInterval((deltaMs) => this.update(deltaMs), 1);
    // 자동 전송(기본 50ms 간격) 대신 물리를 돌릴 때마다 바로 위치를 보낸다
    this.patchRate = null;
  }

  onJoin(client: Client) {
    const spawnX = this.fighters.size === 0 ? ARENA.width * 0.3 : ARENA.width * 0.7;
    this.fighters.set(client.sessionId, this.world.addFighter(spawnX));
    this.state.players.set(client.sessionId, new PlayerState());
    console.log(`[duel ${this.roomId}] ${client.sessionId} 입장 (${this.clients.length}/2)`);
  }

  onLeave(client: Client) {
    const f = this.fighters.get(client.sessionId);
    if (f) this.world.removeFighter(f);
    this.fighters.delete(client.sessionId);
    this.latestInputs.delete(client.sessionId);
    this.state.players.delete(client.sessionId);
    console.log(`[duel ${this.roomId}] ${client.sessionId} 퇴장`);
  }

  onDispose() {
    // Rapier 월드는 WASM 메모리라서 직접 해제해야 한다
    this.world.world.free();
  }

  private update(deltaMs: number) {
    this.accumulatorMs += deltaMs;
    let steps = 0;
    while (this.accumulatorMs >= STEP_MS && steps < MAX_CATCH_UP_STEPS) {
      this.tick();
      this.accumulatorMs -= STEP_MS;
      steps++;
    }
    if (steps === MAX_CATCH_UP_STEPS) this.accumulatorMs = 0;
    if (steps > 0) this.broadcastPatch();
  }

  private tick() {
    for (const [id, f] of this.fighters) {
      const input = this.latestInputs.get(id);
      if (input) f.applyInput(input);
    }
    this.world.step();
    for (const [id, f] of this.fighters) {
      const p = this.state.players.get(id)!;
      const pos = f.position;
      p.x = pos.x;
      p.y = pos.y;
    }
  }
}
