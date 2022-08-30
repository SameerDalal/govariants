export interface Coordinate {
  x: number;
  y: number;
}

/**
 * A 2D analog to the native JavaScript array.  As much as possible,
 * the API should match that of a regular Array.
 */
export class Grid<T> {
  private arr: Array<T>;
  constructor(public readonly width: number, public readonly height: number) {
    if (width < 0) {
      throw new Error("Invalid array width");
    }

    this.arr = new Array(width * height);
  }

  at(index: Coordinate): T | undefined {
    const w = this.width;
    const h = this.height;
    let { x, y } = index;

    // Backwards indexing
    if (x < 0) {
      x = w + x;
    }
    if (y < 0) {
      y = h + y;
    }

    // Out of bounds
    if (x >= w) {
      return undefined;
    }
    if (y >= h) {
      return undefined;
    }

    return this.arr[coordinate_to_flat_index(index, w)];
  }

  map<S>(
    callbackfn: (value: T, index: Coordinate, grid: Grid<T>) => S,
    thisArg?: any
  ): Grid<S> {
    const ret = new Grid<S>(this.width, this.height);
    ret.arr = this.arr.map(
      (value: T, flat_index: number) =>
        callbackfn(
          value,
          flat_index_to_coordinate(flat_index, this.width),
          this
        ),
      thisArg
    );
    return ret;
  }

  static from2DArray<T>(array: T[][]) {
    const height = array.length;

    if (!height) {
      return new Grid<T>(0, 0);
    }

    const width = array[0].length;
    array.forEach((row) => {
      if (width !== row.length) {
        throw new Error("Width of 2D Array not consistent");
      }
    });

    const ret = new Grid<T>(width, height);
    ret.arr = array.flat(1);
    return ret;
  }

  to2DArray(): T[][] {
    const ret: T[][] = [];
    for (let i = 0; i < this.height; ++i) {
      ret.push(this.arr.slice(i * this.width, (i + 1) * this.width));
    }
    return ret;
  }

  /** Note: Unlike its Array counterpart, this method does not take a start and end.
   */
  fill(val: T): Grid<T> {
    this.arr.fill(val);
    return this;
  }
}

function flat_index_to_coordinate(index: number, width: number): Coordinate {
  return { x: index % width, y: Math.floor(index / width) };
}

function coordinate_to_flat_index({ x, y }: Coordinate, width: number): number {
  return y * width + x;
}