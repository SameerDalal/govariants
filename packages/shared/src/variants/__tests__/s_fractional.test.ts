import { SFractional } from "../s_fractional";

// These variables just make the boards a little prettier
const B = 0;
const _ = null;
const W = 1;

test("Play a game", () => {
  const game = new SFractional({ width: 4, height: 4 });
  // Tiny board:
  // B - - -
  // - W - -
  // - - B -
  // - - - W

  game.playMove(0, "aa");
  game.playMove(1, "bb");
  game.playMove(0, "cc");
  game.playMove(1, "dd");

  expect(game.exportState().board).toEqual([
    [B, _, _, _],
    [_, W, _, _],
    [_, _, B, _],
    [_, _, _, W],
  ]);
});
