import type { Abi } from "@truffle/abi-utils";

export interface PrintAbiOptions {
  abi: Abi;
  breakLength?: number;
}

export const printAbi = ({
  abi,
  breakLength = 79
}: PrintAbiOptions) => {
  const printer = new AbiPrinter({ breakLength });

  return printer.print(abi);
}

type AbiPrinterConstructorOptions = Required<Omit<PrintAbiOptions, "abi">>;
class AbiPrinter {
  private tokens: TokenLayout;

  constructor(options: AbiPrinterConstructorOptions) {
    this.tokens = new TokenLayout(options);
  }

  print(abi: Abi): string {
    this.add(abi);
    return this.tokens.read();
  }

  private add<T>(item: T) {
    if (item instanceof Array) {
      this.addArray(item);
    } else if (typeof item === "object") {
      this.addObject(item);
    } else {
      this.tokens.add(JSON.stringify(item));
    }
  }

  private addArray<I>(items: I[]) {
    this.tokens.add("[");
    if (items.length > 0) {
      const [first, ...rest] = items;
      this.add(first);

      for (const item of items.slice(1)) {
        this.tokens.add(",");
        this.add(item);
      }
    }
    this.tokens.add("]");
  }

  private addObject<O>(object: O) {
    this.tokens.add("{");
    const entries = Object.entries(object);
    if (entries.length > 0) {
      const [[key, value], ...rest] = entries;
      this.tokens.add(JSON.stringify(key));
      this.tokens.add(":");
      this.add(value);

      for (const [key, value] of Object.entries(object)) {
        this.tokens.add(",");
        this.tokens.add(JSON.stringify(key));
        this.tokens.add(":");
        this.add(value);
      }
    }
    this.tokens.add("}");
  }
}

type TokenLayoutConstructorOptions = AbiPrinterConstructorOptions;

class TokenLayout {
  private breakLength: number;
  private lines: string[];
  private buffer: string;

  constructor({ breakLength }: TokenLayoutConstructorOptions) {
    this.lines = [];
    this.buffer = "";
    this.breakLength = breakLength;
  }

  add(token: string) {
    const attempt = `${this.buffer}${token}`;
    if (attempt.length > this.breakLength) {
      this.lines.push(this.buffer);
      this.buffer = token;
    } else {
      this.buffer = attempt;
    }
  }

  read(): string {
    return [...this.lines, this.buffer].join("\n");
  }
}
