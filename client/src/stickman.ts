import type Phaser from "phaser";

/** 몸 중심(x, y)을 기준으로 스틱맨을 그린다. 키 약 90px. */
export function drawStickman(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number) {
  g.lineStyle(4, color);
  g.strokeCircle(x, y - 32, 12); // 머리
  g.lineBetween(x, y - 20, x, y + 15); // 몸통
  g.lineBetween(x, y - 10, x - 18, y + 5); // 팔
  g.lineBetween(x, y - 10, x + 18, y + 5);
  g.lineBetween(x, y + 15, x - 14, y + 45); // 다리
  g.lineBetween(x, y + 15, x + 14, y + 45);
}
