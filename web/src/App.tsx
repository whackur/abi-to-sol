import React from 'react';
import './App.css';
import { generateSolidity } from "abi-to-sol";
import defaultAbi from "./defaultAbi.json";
import AceEditor from "react-ace";
import prettier from "prettier";
import prettierSolidity from "prettier-plugin-solidity";
import { Output } from "./Output";

import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";


function App() {
  const [code, setCode] = React.useState(
    JSON.stringify(defaultAbi, undefined, 2)
  );

  const [solidity, setSolidity] = React.useState("");
  const [name, setName] = React.useState<string | undefined>(undefined);
  const [license, setLicense] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    try {
      const solidity = generateSolidity({
        abi: JSON.parse(code),
        name,
        license,
        prettier: false
      });
      console.debug("solidity %o", solidity);

      try {
        const formatted = prettier.format(solidity, {
          plugins: [prettierSolidity],
          parser: "solidity-parse"
        })
        setSolidity(formatted)
      } catch {
        setSolidity(solidity);
      }
    } catch {
    }
  }, [code, name, license]);


  return (
    <div className="App">
      <div className="container">
        <div className="stack">
          <span className="header">ABI</span>
          <form className="options">
            <label>
              Interface name{" "}
              <input type="text" onChange={event => {
                const name = event.target.value || undefined;
                setName(name);
              }} value={name} placeholder="MyInterface" />
            </label>
            <br />
            <label>
              License{" "}
              <input type="text" onChange={event => {
                const license = event.target.value || undefined;
                setLicense(license);
              }} value={license} placeholder="UNLICENSED" />
            </label>
          </form>
          <div className="pane">
            <AceEditor
              placeholder="Placeholder Text"
              mode="json"
              theme="github"
              name="blah2"
              onChange={setCode}
              fontSize={14}
              showPrintMargin={true}
              showGutter={true}
              highlightActiveLine={true}
              value={code}
              style={{
                width: "100%",
                height: "100%"

              }}
              setOptions={{
                enableBasicAutocompletion: false,
                enableLiveAutocompletion: false,
                enableSnippets: false,
                showLineNumbers: true,
                tabSize: 2,
              }}/>


          </div>
        </div>
        <Output contents={solidity} />
      </div>
    </div>
  );
}

export default App;
