export class Pipeline<T> {
  private funcs: ((param: T) => T | Promise<T>)[] = [];

  constructor(private param: T) {}

  through(...funcs: ((param: T) => T | Promise<T>)[]): Pipeline<T> {
    this.funcs.push(...funcs);

    return this;
  }

  /**
   * Passes the value through each function in turn, waiting for each one.
   * A function that throws or rejects stops the pipeline and rejects the returned promise.
   */
  async return(): Promise<T> {
    let value = this.param;
    for (const func of this.funcs) {
      value = await func(value);
    }

    return value;
  }
}

export const pipe = <T>(value: T): Pipeline<T> => {
  return new Pipeline<T>(value);
};
