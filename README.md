# Stickman Duel

지형지물을 활용하는 온라인 1대1 스틱맨 격투 게임.

## 필요한 것

- Node.js 22 이상
- pnpm 10 (`corepack enable` 한 번 실행하면 자동으로 맞는 버전이 잡힘)

## 실행

```bash
pnpm install
pnpm dev
```

Windows에서는 `start-dev.cmd`를 더블클릭해도 됩니다. 꺼져 있는 서버만 켜고 게임 화면을 엽니다.

- 게임 화면: http://localhost:5173
- 게임 서버: ws://localhost:2567

브라우저 탭을 두 개 열면 두 스틱맨이 같은 방에 들어가 서로의 움직임이 보입니다. 조작은 A/D 이동, W 점프.
서버 없이 `pnpm dev:client`만 켜면 오프라인 연습 모드로 혼자 움직여볼 수 있습니다.

## 자주 쓰는 명령

| 명령 | 하는 일 |
| --- | --- |
| `pnpm dev` | 클라이언트와 서버를 함께 실행 (코드 저장 시 자동 반영) |
| `pnpm dev:client` | 클라이언트만 실행 |
| `pnpm dev:server` | 서버만 실행 |
| `pnpm typecheck` | 전체 타입 검사 |
| `pnpm build` | 타입 검사 + 클라이언트 배포용 빌드 (`client/dist`) |

## 폴더 구조

```
client/   브라우저 게임 (Vite + Phaser 3)
  src/scenes/ArenaScene.ts   아레나 화면, 입력 처리, 그리기
  src/net.ts                 서버 접속
server/   게임 서버 (Node.js + Colyseus)
  src/rooms/DuelRoom.ts      1대1 방: 입력을 받아 물리를 돌리고 위치를 동기화
shared/   클라이언트와 서버가 함께 쓰는 코드
  src/index.ts               상수, 메시지 타입
  src/physics.ts             Rapier 물리 (지형, 캐릭터 이동, 점프)
```

## 구조 한눈에 보기

- **서버 권한 방식**: 클라이언트는 키 입력만 보내고, 위치는 서버가 물리를 계산해서 내려줍니다. 치트를 막기 쉽고 두 화면이 어긋나지 않습니다.
- **물리 코드 공유**: `shared/src/physics.ts`를 서버와 클라이언트가 똑같이 씁니다. 결정론적 Rapier 빌드라서 나중에 클라이언트 예측(입력 지연 줄이기)을 붙일 때 같은 결과가 나옵니다.
- **단위**: Rapier는 미터, 화면은 픽셀입니다. 1미터 = 50픽셀 (`PIXELS_PER_METER`).

## 다음에 손댈 곳

- 지형·오브젝트 추가: `shared/src/physics.ts`의 `PLATFORMS`와 `GameWorld`
- 공격·피격: `InputMessage`에 공격 버튼을 넣고 `DuelRoom.tick()`에서 판정
- 지금은 내 캐릭터도 서버 응답을 기다렸다 움직여서 원격 서버에선 살짝 늦게 느껴질 수 있습니다. 클라이언트 예측은 계획대로 MVP 단계에서 추가합니다.
