import { Component } from "vue";
import BadukBoardSelector from "./components/boards/BadukBoardSelector.vue";
import BadukBoardAbstract from "./components/boards/BadukBoardAbstract.vue";
import ParallelGoBoard from "./components/boards/ParallelGoBoard.vue";
import ChessBoard from "./components/boards/ChessBoard.vue";
import FreezeGoBoard from "./components/boards/FreezeGoBoard.vue";
import FractionalBoard from "./components/boards/FractionalBoard.vue";
import KeimaBoard from "./components/boards/KeimaBoard.vue";
import QuantumBoard from "./components/boards/QuantumBoard.vue";
import SFractionalBoardSelector from "./components/boards/SFractional/SFractionalBoardSelector.vue";

export const playing_table_map: {
  [variant: string]: Component<{ config: unknown; gamestate: unknown }>;
} = {
  baduk: BadukBoardSelector,
  phantom: BadukBoardSelector,
  badukWithAbstractBoard: BadukBoardAbstract,
  parallel: ParallelGoBoard,
  capture: BadukBoardSelector,
  chess: ChessBoard,
  tetris: BadukBoardSelector,
  pyramid: BadukBoardSelector,
  "thue-morse": BadukBoardSelector,
  freeze: FreezeGoBoard,
  fractional: FractionalBoard,
  keima: KeimaBoard,
  "one color": BadukBoardSelector,
  drift: BadukBoardSelector,
  quantum: QuantumBoard,
  sfractional: SFractionalBoardSelector,
};
