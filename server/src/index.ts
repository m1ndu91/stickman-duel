import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { ROOM_NAME, SERVER_PORT } from "@stickman/shared";
import { initPhysics } from "@stickman/shared/physics";
import { DuelRoom } from "./rooms/DuelRoom.js";

await initPhysics();

const server = new Server({ transport: new WebSocketTransport() });
server.define(ROOM_NAME, DuelRoom);

const port = Number(process.env.PORT ?? SERVER_PORT);
await server.listen(port);
console.log(`게임 서버 실행 중: ws://localhost:${port}`);
