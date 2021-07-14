import { Abi as SchemaAbi } from "@truffle/contract-schema/spec";
import Emittery from "emittery";

const { Compile, CompilerSupplier } = require("@truffle/compile-solidity");

export interface CompileAbiOptions {
  contents: string;
  solidityVersion: string;
}

export const compileAbi = async ({
  contents,
  solidityVersion,
}: CompileAbiOptions): Promise<SchemaAbi> => {
  const source = "interface.sol";

  const {
    compilations: [
      {
        contracts: [{ abi }],
      },
    ],
  } = await Compile.sources({
    sources: {
      "interface.sol": contents,
    },
    options: {
      compilers: {
        solc: {
          version: solidityVersion,
          docker: true,
        },
      },
    },
  });

  return abi;
};
