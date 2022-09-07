import Baduk from "@/components/boards/BadukBoard.vue";
import BadukBoardAbstract from "@/components/boards/BadukBoardAbstract.vue";
import type { Component } from "vue";

export const board_map: {
  [variant: string]: Component<{ config: unknown; gamestate: unknown }>;
} = {
  baduk: Baduk,
  phantom: Baduk,
  badukWithAbstractBoard: BadukBoardAbstract,
};
