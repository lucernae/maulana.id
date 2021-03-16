// custom typefaces
import "typeface-montserrat"
import "typeface-merriweather"

import "prismjs/themes/prism.css"
import "./src/styles/global.css"


const addScript = (url) => {
    const script = document.createElement('script')
    script.async = true
    script.src = url
    document.body.appendChild(script)
}

export const wrapPageElement = ({element}) => {
    console.log('wrapPage')
    addScript(`https://platform.twitter.com/widgets.js`)
}
