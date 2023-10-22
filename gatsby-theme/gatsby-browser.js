// custom typefaces
import "@fontsource/montserrat/variable.css"
import "@fontsource/merriweather"
// normalize CSS across browsers
import "./src/normalize.css"
// custom CSS styles
import "./src/style.css"

// Highlighting for code blocks
import "prismjs/themes/prism.css"
import "./src/styles/global.css"
import { Script } from "gatsby"
import React from "react"

export const wrapPageElement = ({ element, props }) => {
  return (
    <>
      {element}
      <Script src={`https://platform.twitter.com/widgets.js`} async />
    </>
  )
}

export const wrapRootElement = ({element, props}) => {
  return (
    <>
      {element}
    </>
  )
}
