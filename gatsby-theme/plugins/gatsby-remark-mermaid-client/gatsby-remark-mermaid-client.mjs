import visit from 'unist-util-visit'

const metaRe = /\b([-\w]+)(?:=(?:"([^"]*)"|'([^']*)'|([^"'\s]+)))?/g

export const gatsbyRemarkMermaidClient = async ({
    markdownAST,
    markdownNode,
    cache,
}) => {
    visit(markdownAST, 'code', async (node, index, parent) => {
        if (node == null) {
            return
        }
        if (node.lang == "mermaid") {
            if (node.meta == null){
                // render as usual code block if it has no meta
                return
            }
            const originalNode = {...node}
            metaRe.lastIndex = 0
            let render = false
            let match
            while ((match = metaRe.exec(originalNode.meta))) {
                if(match[1] === "render") {
                    render = true
                }
            }
            if(!render){
                return
            }
            const value = node.value
            node.value = `<pre class="mermaid">${value}</pre>`
            node.type = "html"
            node.meta = undefined
            node.children = []
        }
        return index
    })
    return markdownAST
}

export default gatsbyRemarkMermaidClient