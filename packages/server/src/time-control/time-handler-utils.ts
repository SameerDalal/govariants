import {
  GenericTimeControl,
  IConfigWithTimeControl,
  IFischerConfig,
  IPerPlayerTimeControlBase,
  ITimeControlBase,
  TimeControlType,
  makeGameObject,
} from "@ogfcommunity/variants-shared";

export function initialState(
  variant: string,
  config: IConfigWithTimeControl,
): ITimeControlBase;
export function initialState<T extends IPerPlayerTimeControlBase>(
  variant: string,
  config: IConfigWithTimeControl,
  modifier: (per_player_base: IPerPlayerTimeControlBase) => T,
): GenericTimeControl<T>;
export function initialState(
  variant: string,
  config: IConfigWithTimeControl,
  modifier: (
    per_player_base: IPerPlayerTimeControlBase,
  ) => IPerPlayerTimeControlBase = (base) => base,
): ITimeControlBase {
  const numPlayers = makeGameObject(variant, config).numPlayers();

  const timeControl: ITimeControlBase = {
    moveTimestamps: [],
    forPlayer: {},
  };

  for (let i = 0; i < numPlayers; i++) {
    timeControl.forPlayer[i] = modifier({
      remainingTimeMS: config.time_control.mainTimeMS,
      onThePlaySince: null,
    });
  }

  switch (config.time_control.type) {
    case TimeControlType.Absolute: {
      // nothing to do
      break;
    }

    case TimeControlType.Fischer: {
      // nothing to do
      break;
    }

    default: {
      console.error("received config with invalid time control type");
    }
  }

  return timeControl;
}

export function makeTransition<T extends IPerPlayerTimeControlBase>(
  getElapsedMS: (playerData: T) => number,
  config: IConfigWithTimeControl,
  move: string,
  game_id: string,
): (playerData: T) => void {
  switch (config.time_control.type) {
    case TimeControlType.Absolute: {
      return (playerData) => {
        if (move === "timeout") {
          playerData.remainingTimeMS = 0;
          return;
        }

        playerData.remainingTimeMS -= getElapsedMS(playerData);
      };
    }

    case TimeControlType.Fischer: {
      const fischerConfig = config.time_control as IFischerConfig;
      return (playerData) => {
        if (move === "timeout") {
          playerData.remainingTimeMS = 0;
          return;
        }

        const uncapped =
          playerData.remainingTimeMS +
          fischerConfig.incrementMS -
          getElapsedMS(playerData);

        playerData.remainingTimeMS =
          fischerConfig.maxTimeMS === null
            ? uncapped
            : Math.min(uncapped, fischerConfig.maxTimeMS);
      };
    }

    case TimeControlType.Invalid:
      throw Error(`game with id ${game_id} has invalid time control type`);
  }
}
