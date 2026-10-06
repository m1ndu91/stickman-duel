import { Client, type Room } from "@colyseus/sdk";
import { ROOM_NAME, SERVER_PORT } from "@stickman/shared";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? `ws://${location.hostname}:${SERVER_PORT}`;

export interface RemotePlayer {
  x: number;
  y: number;
}

export interface DuelStateView {
  players: Map<string, RemotePlayer>;
}

/** 서버에 접속해 대전 방에 들어간다. 서버가 꺼져 있으면 null. */
export async function joinDuel(): Promise<Room<any, DuelStateView> | null> {
  try {
    return await new Client(SERVER_URL).joinOrCreate<DuelStateView>(ROOM_NAME);
  } catch (err) {
    console.warn("서버 접속 실패, 오프라인 연습 모드로 실행합니다.", err);
    return null;
  }
}
