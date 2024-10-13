import { Coordinate } from "../lib/coordinate";
import { Grid } from "../lib/grid";
import { AbstractGame } from "../abstract_game";
import { BoardConfig } from "../lib/abstractBoard/boardFactory";
import { Color } from "./fractional/fractional";

export type SFractionalConfig = {
  komi: number;
  board: BoardConfig;
  secondary_colors: number;
  players_per_team: number;
};

export type SFractionalState = {
  board: Color[][][] | [number, Color[]][];
};

export class SFractional extends AbstractGame<
  SFractionalConfig,
  SFractionalState
> {
  public board: Grid<number | null>;
  protected next_to_play: 0 | 1 = 0;

  // Initialize state of the game for a given config
  constructor(config?: SFractionalConfig) {
    // AbstractGame will set this.config to the defaultConfig() if config is undefined.
    // Therefore, we access config through this.config in the rest of this function
    super(config);

    if (this.config.width >= 25 || this.config.height >= 25) {
      // You can throw from this function to signify an invalid config
      // It is highly recommended to put a cap on board size to prevent
      // overloading the CPU
      throw new Error("Board too big!");
    }

    this.board = new Grid<Color>(this.config.width, this.config.height).fill(
      null,
    );
  }

  // Return an object that represents the state of the game as it should be displayed to
  // the user.  The player parameter can be used to determine which parts of the state
  // should not be shown.
  override exportState(/* player?: number */): SFractionalState {
    return {
      board: this.board.to2DArray(),
    };
  }

  // Return an array of the players who can place a stone in this round
  override nextToPlay(): number[] {
    // Return empty array if game is over.
    // You can check the phase property of AbstractGame
    if (this.phase === "gameover") {
      return [];
    }

    // Return a list of the players who may submit a move
    // [0, 1] means either player can make a move - you will likely want to change this
    return [0, 1];
  }

  // Validate move and update the state accordingly
  override playMove(player: number, move: string): void {
    if (move === "resign") {
      // Set phase to "gameover" to end the game
      // phase is a property of the AbstractGame class
      this.phase = "gameover";
      // result is also a property of the AbstractGame class, and is displayed to the user
      this.result = this.next_to_play === 0 ? "W+R" : "B+R";
      return;
    }

    if (move === "timeout") {
      // "timeout" is a special move sent by the system, and is handled similar
      // "resign"
      this.phase = "gameover";
      this.result = player === 0 ? "W+T" : "B+T";
      return;
    }

    if (move == "pass") {
      // It is important to increase the round in order for game playback
      // and timers to work
      super.increaseRound();
      return;
    }

    const decoded_move = Coordinate.fromSgfRepr(move);
    if (!this.board.isInBounds(decoded_move)) {
      // You can throw from the playMove() function to signify invalid moves
      throw Error(
        `Move out of bounds. (move: ${decoded_move}, board dimensions: ${this.config.width}x${this.config.height}`,
      );
    }

    // After checking the move is valid
    this.board.set(decoded_move, player);

    // It is important to increase the round in order for game playback
    // and timers to work
    super.increaseRound();
  }

  override numPlayers(): number {
    return 2;
  }

  // These show up as buttons in the UI
  // The key is the string that is passed to playMove(), and the value is
  // the string that is displayed on the button
  override specialMoves(): { [key: string]: string } {
    return { pass: "Pass", resign: "Resign" };
  }

  defaultConfig(): SFractionalConfig {
    return { width: 19, height: 19 };
  }
}
