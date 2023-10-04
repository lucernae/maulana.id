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

const addScript = url => {
  const script = document.createElement("script")
  script.async = true
  script.src = url
  document.body.appendChild(script)
}

export const wrapPageElement = ({ element }) => {
  addScript(`https://platform.twitter.com/widgets.js`)
}
