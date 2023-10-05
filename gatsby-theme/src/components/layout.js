import * as React from "react"
import { MDXProvider } from "@mdx-js/react"
import GeoGebra from "./geogebra"

// import { rhythm, scale } from "../utils/typography"
import "katex/dist/katex.min.css"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  const shortcodes = { GeoGebra }

  return (
<MDXProvider
      components={shortcodes}>
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
</MDXProvider>
  )
}

export default Layout
