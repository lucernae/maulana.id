/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import config from "../config"

import { rhythm } from "../utils/typography"

const Bio = () => {
  // use next/image for image optim
  const author = config.author
  const social = config.social
  return (
    <div
      style={{
        display: `flex`,
        marginBottom: rhythm(2.5),
      }}
    >
      <img
        src="/avatar.jpg"
        alt={author.name}
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
          minWidth: 50,
          borderRadius: `100%`,
        }}
        imgStyle={{
          borderRadius: `50%`,
        }}
      />
      <p>
        Written by <strong>{author.name}</strong> 
        <br />
        {author.summary}
        {` `}
        
        <br/>
        <a href={`https://twitter.com/${social.twitter}`}>
          <img alt="Twitter Follow" src={`https://img.shields.io/twitter/follow/${social.twitter}?style=social`}></img>
        </a>
        <a href={`https://github.com/${social.github}`}>
          <img alt="GitHub followers" src={`https://img.shields.io/github/followers/${social.github}?style=social`}></img>
        </a>
      </p>
    </div>
  )
}

export default Bio
