import { Baduk } from "./baduk";
import { AbstractGame } from "./abstract_game";
import { Phantom } from "./phantom";

export const game_map: {
  [variant: string]: new (config: any) => AbstractGame;
} = {
  baduk: Baduk,
  phantom: Phantom,
};

class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function makeGameObject(
  variant: string,
  config: any
): AbstractGame<any, any> {
  try {
    return new game_map[variant](config);
  } catch (e) {
    throw new ConfigError(
      `${e}, (variant: ${variant}, config: ${JSON.stringify(config)})`
    );
  }
}

export function getVariantList(): string[] {
  return Object.keys(game_map);
}