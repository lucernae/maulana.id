import * as React from "react"
import { Script } from "gatsby"

export const MermaidModule = () => {
    const scriptText = `
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({startOnLoad:false});
        await mermaid.run();
    `
    return (
        <Script type="module"
            dangerouslySetInnerHTML={{ __html: scriptText }}
        />
    )
}

const Mermaid = ({ withCode, children }) => {
    const diagramCode = children
    let diagramNode = (<></>)
    if (diagramCode != null) {
        diagramNode = (
            <pre className="mermaid"
                dangerouslySetInnerHTML={{ __html: diagramCode }}
            />
        )
    }
    return (
        <>
            {diagramNode}
            <MermaidModule />
        </>
    )
}

export default Mermaid