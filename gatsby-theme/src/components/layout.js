import * as React from "react"
import { Script } from "gatsby"
import { MDXProvider } from "@mdx-js/react"
import GeoGebra from "./geogebra"
import Comments from "./comments"
import Mermaid, { MermaidModule } from "./mermaid"

// import { rhythm, scale } from "../utils/typography"
import "katex/dist/katex.min.css"

const Layout = ({ location, title, children, commentsEnabled, commentsProps }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  const shortcodes = { GeoGebra, Mermaid, Comments }
  return (
    <MDXProvider
      components={shortcodes}>
      <div className="global-wrapper" data-is-root-path={isRootPath}>
        <main>{children}</main>
        <Comments 
          enabled={commentsEnabled}
          {...commentsProps}
        />
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.com">Gatsby</a>
        </footer>
      </div>
      <MermaidModule/>
    </MDXProvider>
  )
}

export default Layout
