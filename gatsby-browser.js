// custom typefaces
import "typeface-montserrat"
import "typeface-merriweather"

import "prismjs/themes/prism.css"


const addScript = ({url}) => {
    const script = document.createElement('script')
    script.async = true
    script.src = url
    document.body.appendChild(script)
}

export const wrapPageElement = ({element}) => {
    addScript(`https://platform.twitter.com/widgets.js`)
}