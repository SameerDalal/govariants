<script setup lang="ts">
import { BadukState } from "@ogfcommunity/variants-shared";
import {
  mapToNewBadukConfig,
  type BadukWithAbstractBoardConfig,
} from "@ogfcommunity/variants-shared/src/variants/badukWithAbstractBoard";
import { computed } from "vue";
import BadukBoardSelector from "./BadukBoardSelector.vue";

const props = defineProps<{
  config: BadukWithAbstractBoardConfig;
  gamestate: BadukState;
}>();

const badukConfig = computed(() => mapToNewBadukConfig(props.config));

const emit = defineEmits<{
  (e: "move", move: string): void;
}>();

function emitMove(move: string) {
  emit("move", move);
}
</script>

<template>
  <BadukBoardSelector
    :config="badukConfig"
    :gamestate="$props.gamestate"
    @move="emitMove"
  />
</template>
