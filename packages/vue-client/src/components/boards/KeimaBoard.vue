<script lang="ts">
function getKeimaMoves({ x, y }: Coordinate, board: Grid<Color>): Coordinate[] {
  const moves = [
    new Coordinate(x + 1, y + 2),
    new Coordinate(x - 1, y + 2),
    new Coordinate(x + 1, y - 2),
    new Coordinate(x - 1, y - 2),
    new Coordinate(x + 2, y + 1),
    new Coordinate(x - 2, y + 1),
    new Coordinate(x + 2, y - 1),
    new Coordinate(x - 2, y - 1),
  ];
  return moves
    .filter((pos) => board.isInBounds(pos))
    .filter((pos) => board.at(pos) === Color.EMPTY);
}
</script>

<script setup lang="ts">
import MulticolorGridBoard from "./MulticolorGridBoard.vue";
import {
  Coordinate,
  type KeimaState,
  Grid,
  Color,
  getWidthAndHeight,
} from "@ogfcommunity/variants-shared";
import { GridBadukConfig } from "@ogfcommunity/variants-shared";
import { computed } from "vue";

const props = defineProps<{
  config: GridBadukConfig;
  gamestate: KeimaState;
}>();

const board_dimensions = computed(() => getWidthAndHeight(props.config));

const emit = defineEmits<{
  (e: "move", pos: string): void;
}>();

function positionClicked(pos: Coordinate) {
  emit("move", pos.toSgfRepr());
}

const board = computed(() => {
  const grid = Grid.from2DArray(props.gamestate.board);

  const output_grid: Grid<{ colors: string[]; annotation?: "CR" } | null> =
    grid.map((color) => {
      switch (color) {
        case Color.BLACK:
          return { colors: ["black"] };
        case Color.WHITE:
          return { colors: ["white"] };
        case Color.EMPTY:
          return null;
      }
    });

  if (props.gamestate.keima) {
    getKeimaMoves(Coordinate.fromSgfRepr(props.gamestate.keima), grid).forEach(
      (pos) => output_grid.set(pos, { colors: [], annotation: "CR" }),
    );
  }

  return output_grid.to2DArray();
});
</script>

<template>
  <MulticolorGridBoard
    :board="board"
    :board_dimensions="board_dimensions"
    @click="positionClicked"
  />
</template>
