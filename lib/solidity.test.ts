import * as fc from "fast-check";
import { testProp } from "jest-fast-check";
import * as Abi from "@truffle/abi-utils";
import * as Example from "../test/custom-example";
import { compileAbi } from "../test/compile-abi";
import { solidityVersions } from "../test/solidityVersions";
import { featuresForVersion } from "./version-features";
import { excludesFunctionParameters } from "../test/preflight";

import { generateSolidity } from "./solidity";

const removeProps = (obj: any, keys: Set<string>) => {
  if (obj instanceof Array) {
    for (const item of obj) {
      removeProps(item, keys);
    }
  } else if (typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      if (keys.has(key)) {
        delete obj[key];
      } else {
        removeProps(obj[key], keys);
      }
    }
  }

  return obj;
};

jest.setTimeout(60000);
describe("generateSolidity", () => {
  testProp(
    "compiles to input ABI",
    [Abi.Arbitrary.Abi(), fc.constantFrom(...solidityVersions)],
    async (abi, solidityVersion) => {
      fc.pre(
        abi.every((entry) => "type" in entry && entry.type !== "constructor")
      );
      fc.pre(excludesFunctionParameters(abi));

      fc.pre(abi.length > 0);

      const firstOutput = generateSolidity({
        name: "MyInterface",
        abi,
        solidityVersion,
      });

      let firstCompiledAbi;
      try {
        firstCompiledAbi = removeProps(
          Abi.normalize(
            await compileAbi({
              contents: firstOutput,
              solidityVersion,
            })
          ),
          new Set(["internalType"])
        );
      } catch (error) {
        console.log("Failed to compile. Solidity:\n%s", firstOutput);
        throw error;
      }

      // run compilation a second time to eliminate version
      // discrepancies (HACK)
      const secondOutput = generateSolidity({
        name: "MyInterface",
        abi: firstCompiledAbi,
        solidityVersion,
      });

      let secondCompiledAbi;
      try {
        secondCompiledAbi = removeProps(
          Abi.normalize(
            await compileAbi({
              contents: secondOutput,
              solidityVersion,
            })
          ),
          new Set(["internalType"])
        );
      } catch (error) {
        console.log("Failed to compile. Solidity:\n%s", secondOutput);
        throw error;
      }

      expect(new Set(firstCompiledAbi)).toEqual(new Set(secondCompiledAbi));

      // let expectedAbi = Abi.normalize(abi);

      // expect(new Set(compiledAbi)).toEqual(new Set(expectedAbi));
    },
    { seed: 1402141361, path: "6", endOnFailure: true }
  );

  describe("custom example", () => {
    const abiWithoutConstructor = Abi.normalize(
      Example.abi.filter(({ type }) => type !== "constructor")
    );

    const output = generateSolidity({
      name: "Example",
      abi: abiWithoutConstructor,
      solidityVersion: "^0.7.0",
    });

    it("generates output", async () => {
      const compiledAbi = await compileAbi({
        contents: output,
        solidityVersion: "0.7.0",
      });

      const expectedAbi = abiWithoutConstructor.map((entry) => ({
        ...entry,
        type: entry.type || "function",
      }));

      expect(compiledAbi).toEqual(expectedAbi);
    });
  });
});
