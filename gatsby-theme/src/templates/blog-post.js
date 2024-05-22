import * as React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"

import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import NavigationPanel, { GetNavigationLinks } from "../components/navigation"

const BlogPostTemplate = ({
  data: { previous, next, site, mdx: post },
  children,
  location,
}) => {
  const siteTitle = site.siteMetadata?.title || `Title`
  const navigationLinks = GetNavigationLinks()
  const quickNav = <nav className="blog-post-nav">
    <ul
      style={{
        display: `flex`,
        flexWrap: `wrap`,
        justifyContent: `space-between`,
        listStyle: `none`,
        padding: 0
      }}
    >
      <li>
        {previous && (
          <Link to={previous.fields.slug} rel="prev">
            ← {previous.frontmatter.title}
          </Link>
        )}
      </li>
      <li>
        {next && (
          <Link to={next.fields.slug} rel="next">
            {next.frontmatter.title} →
          </Link>
        )}
      </li>
    </ul>
  </nav>
  return (
    <div>
      <NavigationPanel location={location} navigationLinks={navigationLinks}>
        {siteTitle}
      </NavigationPanel>
      <Layout
        location={location}
        title={siteTitle}
        commentsEnabled={post.frontmatter.comments}
        commentsProps={site.siteMetadata?.config?.commentsProps}
      >
        {quickNav}
        <article
          className="blog-post"
          itemScope
          itemType="http://schema.org/Article"
        >
          <header>
            <h1 itemProp="headline">{post.frontmatter.title}</h1>
            <p>{post.frontmatter.date}</p>
          </header>
          {children}
          <hr />
          <footer>
            <Bio />
          </footer>
        </article>
        {quickNav}
      </Layout>
    </div>
  )
}

export const Head = ({ data: { mdx: post } }) => {
  return (
    <Seo
      title={post.frontmatter.title}
      description={post.frontmatter.description || post.excerpt}
    />
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $slug: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
        config {
          categoryNameForAll
          commentsProps {
            repo
            repoId
            category
            categoryId
            mapping
            strict
            reactionsEnabled
            emitMetadata
            inputPosition
            theme
            lang
            loading
          }
        }
      }
    }
    mdx(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      fields {
        slug
      }
      frontmatter {
        title
        date(formatString: "DD-MMM-YYYY")
        description
        category {
          name
          index
          depth
        }
        tags
        comments
      }
    }
    previous: mdx(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: mdx(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`
