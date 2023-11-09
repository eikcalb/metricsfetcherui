import hljs from "highlight.js";
import { useEffect, useState } from "react";

export function Code(props: any) {
  const [codeData, setCodeData] = useState("");

  useEffect(() => {
    setCodeData(hljs.highlightAuto(props.children, ['javascript', 'json']).value);
  }, [props.children]);

  return <span dangerouslySetInnerHTML={{ __html: codeData }} />;
}
