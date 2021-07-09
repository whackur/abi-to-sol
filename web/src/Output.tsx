import React from 'react';

import { CopyButton } from "./CopyButton";

// Highlight.js setup
import "highlight.js/styles/default.css";
import hljs from "highlight.js";
import hljsDefineSolidity from "highlightjs-solidity";
hljsDefineSolidity(hljs);
hljs.initHighlightingOnLoad();


export interface OutputOptions {
  contents: string;
}

export const Output = ({
  contents
}: OutputOptions) => {
  const [html, setHtml] = React.useState("");

  React.useEffect(() => {
    try {
      setHtml(hljs.highlight(contents, { language: "solidity" }).value);
    } catch {
      setHtml("Error highlighting Solidity");
    }
  }, [contents]);

  return (
    <div className="stack">
      <span className="header">Solidity</span>
      <span>
        <CopyButton text={contents} />
      </span>
      <div className="pane">
        <pre dangerouslySetInnerHTML={{
          __html: html
        }} />
      </div>
    </div>
  );
}

