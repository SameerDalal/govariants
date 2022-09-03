import type { AbstractGame } from "../abstract_game";
import type { MovesType } from "../abstract_game";
import type { IBadukBoard } from "../Interfaces/IBadukBoard";
import { BadukBoardAbstract } from "./board/BadukBoardAbstract";
import type { Intersection } from "./board/intersection";

export enum Color {
    EMPTY = 0,
    BLACK = 1,
    WHITE = 2,
}

export enum BoardPattern {
    Uknown = 0,
    Rectangular = 1,
    Polygonal = 2,
}

export interface BadukWithAbstractBoardConfig {
    width: number;
    height: number;
    komi: number;
    pattern: BoardPattern;
}

export interface BadukWithAbstractBoardState {
    board: IBadukBoard;
    next_to_play: 0 | 1;
    captures: { 0: number; 1: number };
}

type BadukMovesType = { 0: string } | { 1: string };

export class BadukWithAbstractBoard extends AbstractGame<BadukWithAbstractBoardConfig, BadukWithAbstractBoardState> {
    board: BadukBoardAbstract;
    private next_to_play: 0 | 1 = 0;
    private captures = { 0: 0, 1: 0 };
    private last_move = "";

    constructor(config: BadukWithAbstractBoardConfig) {
        super(config);
        this.board = new BadukBoardAbstract(config);
    }

    exportState(): BadukWithAbstractBoardState {
        return {
            board: this.board.Export(),
            captures: { 0: this.captures[0], 1: this.captures[1] },
            next_to_play: this.next_to_play,
        };
    }

    nextToPlay(): number[] {
        return [this.next_to_play];
    }

    playMove(moves: BadukMovesType): void {
        const { player, move } = getOnlyMove(moves);
        if (player != this.next_to_play) {
            throw Error(`It's not player ${player}'s turn!`);
        }
        this.next_to_play = this.next_to_play === 0 ? 1 : 0;

        if (move == "pass") {
            if (this.last_move === "pass") {
                //this.finalizeScore();
            } else {
                this.last_move = move;
            }
            return;
        }

        if (move === "resign") {
            this.phase = "gameover";
            this.result = this.next_to_play === 0 ? "B+R" : "W+R";
            return;
        }

        const decoded_move = decodeMove(move);
        if (isOutOfBounds(decoded_move, this.board)) {
            throw Error(
                `Move out of bounds. (move: ${decoded_move}, intersections: ${this.board.Intersections.length}`
            );
        }
        let intersection = this.board.Intersections[decoded_move];

        if (intersection.StoneState.Color != Color.EMPTY) {
            throw Error(
                `Cannot place a stone on top of an existing stone. (${intersection.StoneState.Color} at (${decoded_move}))`
            );
        }
        const player_color = player === 0 ? Color.BLACK : Color.WHITE;
        const opponent_color = player === 0 ? Color.WHITE : Color.BLACK;
        intersection.StoneState.Color = player_color;

        // Capture any opponent groups
        intersection.Neighbours.forEach((neighbour) => {
            if (
                neighbour.StoneState.Color === opponent_color &&
                !groupHasLiberties(neighbour, this.board)
            ) {
                this.captures[player] += removeGroup(intersection, this.board);
            }
        });

        // Detect suicide
        if (!groupHasLiberties(intersection, this.board)) {
            console.log(this.board);
            throw Error("Move is suicidal!");
        }

        this.last_move = move;
    }

    numPlayers(): number {
        return 2;
    }

    /*private finalizeScore(): void {
        const board = copyBoard(this.board);

        const visited: { [key: string]: Boolean } = {};
        board.Intersections.forEach((i: Intersection) => visited[i.Identifier] = false);

        const determineController = (intersection: Intersection): Color => {
            let color = intersection.StoneState.Color;
            if (color !== Color.EMPTY) {
                return color;
            }
            if (visited[intersection.Identifier]) {
                return Color.EMPTY;
            }
            visited[intersection.Identifier] = true;
            const neighbor_results =
                intersection.Neighbours.map(determineController);
            const saw_white = neighbor_results.includes(Color.WHITE);
            const saw_black = neighbor_results.includes(Color.BLACK);
            if (saw_black && saw_white) {
                return Color.EMPTY;
            }
            if (saw_black) {
                return Color.BLACK;
            }

            if (saw_white) {
                return Color.WHITE;
            }
            return Color.EMPTY;
        };

        for (let y = 0; y < this.config.height; y++) {
            for (let x = 0; x < this.config.width; x++) {
                if (visited[y][x]) {
                    continue;
                }
                if (board[y][x] === Color.EMPTY) {
                    const controller = determineController({ x, y });
                    floodFill({ x, y }, controller, board);
                }
            }
        }

        const black_points: number = countValueIn2dArray(Color.BLACK, board);
        const white_points: number =
            countValueIn2dArray(Color.WHITE, board) + this.config.komi;
        const diff = black_points - white_points;
        if (diff < 0) {
            this.result = `W+${-diff}`;
        } else if (diff > 0) {
            this.result = `B+${diff}`;
        } else {
            this.result = "Tie";
        }

        this.phase = "gameover";
    }*/

    specialMoves() {
        return { pass: "Pass", resign: "Resign" };
    }
}

function decodeMove(move: string): number {
    return Number(move);
}

/** Returns true if the group containing intersection has at least one liberty. */
function groupHasLiberties(intersection: Intersection, board: BadukBoardAbstract) {
    const color = intersection.StoneState.Color;
    const visited: { [key: string]: Boolean } = {};
    board.Intersections.forEach(i => visited[i.Identifier] = false);

    function helper(intersection: Intersection): boolean {

        if (intersection.StoneState.Color === Color.EMPTY) {
            // found a liberty
            return true;
        }
        if (color !== intersection.StoneState.Color) {
            // opponent color
            return false;
        }
        if (visited[intersection.Identifier]) {
            // Already seen
            return false;
        }
        visited[intersection.Identifier] = true;
        return intersection.Neighbours.some(helper);
    }

    return helper(intersection);
}

/**
 * Removes the group containing pos, and returns the number of stones removed
 * from the board.
 */
function removeGroup(intersection: Intersection, board: IBadukBoard): number {
    return floodFill(intersection, Color.EMPTY, board);
}

/** Asserts there is exaclty one move, and returns it */
function getOnlyMove(moves: MovesType): { player: number; move: string } {
    const players = Object.keys(moves);
    if (players.length > 1) {
        throw Error(`More than one player: ${players}`);
    }
    if (players.length === 0) {
        throw Error("No players specified!");
    }
    const player = Number(players[0]);
    return { player, move: moves[player] };
}

function isOutOfBounds(i: number, board: BadukBoardAbstract): boolean {
    return (i < 0 || i >= board.Intersections.length);
}

/** Fills area with the given color, and returns the number of spaces filled. */
function floodFill(
    intersection: Intersection,
    target_color: Color,
    board: IBadukBoard
): number {
    const starting_color = intersection.StoneState.Color;
    if (starting_color === target_color) {
        return 0;
    }

    function helper(intersection: Intersection): number {

        if (starting_color !== intersection.StoneState.Color) {
            return 0;
        }

        intersection.StoneState.Color = target_color;

        return intersection.Neighbours
            .map(helper)
            .reduce((acc, val) => acc + val, 1);
    }

    return helper(intersection);
}

/** Returns the number of occurrences for the given color */
function countValueIn2dArray<T>(value: T, array: T[][]) {
    return array.flat().filter((val) => val === value).length;
}
