import { Room, type Client } from "@colyseus/core";
import { ARENA, TICK_RATE, type InputMessage } from "@stickman/shared";
import { GameWorld, type Fighter } from "@stickman/shared/physics";
import { DuelState, PlayerState } from "../state.js";

/** 1대1 대전 방. 서버가 물리를 직접 돌리는 서버 권한(authoritative) 구조. */
export class DuelRoom extends Room<{ state: DuelState }> {
  maxClients = 2;
  state = new DuelState();

  private world = new GameWorld();
  private fighters = new Map<string, Fighter>();
  private latestInputs = new Map<string, InputMessage>();

  onCreate() {
    this.onMessage("input", (client, input: InputMessage) => {
      this.latestInputs.set(client.sessionId, input);
    });
    this.setSimulationInterval(() => this.tick(), 1000 / TICK_RATE);
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
