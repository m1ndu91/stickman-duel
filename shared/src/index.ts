// 클라이언트와 서버가 함께 쓰는 상수와 메시지 타입

export const SERVER_PORT = 2567;
export const ROOM_NAME = "duel";

/** 물리 시뮬레이션 고정 틱 (초당 60회) */
export const TICK_RATE = 60;

/** Rapier는 미터 단위, 화면은 픽셀 단위라서 변환 비율을 정해둔다 */
export const PIXELS_PER_METER = 50;

export const ARENA = { width: 1280, height: 720 } as const;

/** 클라이언트가 매 틱 서버로 보내는 입력 */
export interface InputMessage {
  left: boolean;
  right: boolean;
  jump: boolean;
}
