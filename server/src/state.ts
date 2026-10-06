import { schema, t, type SchemaType } from "@colyseus/schema";

// 서버가 클라이언트에게 자동으로 동기화하는 상태
export const PlayerState = schema({ x: t.number(), y: t.number() }, "PlayerState");
export type PlayerState = SchemaType<typeof PlayerState>;

export const DuelState = schema({ players: t.map(PlayerState) }, "DuelState");
export type DuelState = SchemaType<typeof DuelState>;
