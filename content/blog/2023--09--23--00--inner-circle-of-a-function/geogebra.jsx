import React from "react"

const GeoGebra = (props) => {
    return (
        <iframe 
            title="Snippet" 
            src="https://www.geogebra.org/calculator/upcycxdz?embed" 
            width="800" height="600" 
            allowFullScreen 
            style={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "#e4e4e4",
                borderRadius: "4px"
            }}>
        </iframe>
        // <div>hello</div>
    )
}

export default GeoGebra