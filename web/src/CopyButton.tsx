import React from "react";

export interface CopyButtonOptions {
  text: string;
}

export const CopyButton = ({ text }: CopyButtonOptions) => {
  const [copyStatus, copy] = useCopyToClipboard(text);
  let buttonText = 'Copy to clipboard'

  if (copyStatus === 'copied') {
    buttonText = 'Copied'
  } else if (copyStatus === 'failed') {
    buttonText = 'Copy failed!'
  }

  return <button onClick={copy}>{buttonText}</button>
}

function useCopyToClipboard(
  text: string,
  notifyTimeout = 2500
): [string, () => void] {
  const [copyStatus, setCopyStatus] = React.useState('inactive')
  const copy: () => void = React.useCallback(() => {
    navigator.clipboard.writeText(text).then(
      () => setCopyStatus('copied'),
      () => setCopyStatus('failed'),
    )
  }, [text])

  React.useEffect(() => {
    if (copyStatus === 'inactive') {
      return
    }

    const timeoutId = setTimeout(() => setCopyStatus('inactive'), notifyTimeout)

    return () => clearTimeout(timeoutId)
  }, [copyStatus, notifyTimeout])

  return [copyStatus, copy]
}
