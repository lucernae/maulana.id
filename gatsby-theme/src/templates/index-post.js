import * as React from "react"
import { Link, graphql, navigate } from "gatsby"

import { Pagination } from "@mui/material"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"

import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import NavigationPanel, { GetNavigationLinks } from "../components/navigation"
import { PathJoin } from "../utils/common"

const IndexPostTemplate = ({
  data: { site, post, posts },
  children,
  location,
}) => {
  const siteTitle = site.siteMetadata?.title || `Title`
  const navigationLinks = GetNavigationLinks()
  const handlePageChange = (event, page) => {
    let category = post.frontmatter.category
    if (category === null) {
      category = {}
    }
    if (category?.name === site.siteMetadata.config.categoryNameForAll) {
      category.name = "/"
    }
    let linkPath = PathJoin("/", category.name, `index-page/${page}`)
    if (page === 1) {
      navigate(PathJoin("/", category.name))
      return
    }
    navigate(linkPath)
    return
  }
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
        algoliaProps={site.siteMetadata?.config?.algoliaProps}
      >
        <Bio />
        <article
          className="blog-post"
          itemScope
          itemType="http://schema.org/Article"
        >
          <header>
            <h1 itemProp="headline">{post.frontmatter.title}</h1>
          </header>
          {children}
          <hr />
          <Pagination
            page={posts.pageInfo.currentPage}
            hidePrevButton={!posts.pageInfo.hasPreviousPage}
            hideNextButton={!posts.pageInfo.hasNextPage}
            count={posts.pageInfo.pageCount}
            onChange={handlePageChange}
          />
          <ol style={{ listStyle: `none` }}>
            {posts.nodes.map(post => {
              const title = post.frontmatter.title || post.fields.slug

              return (
                <li key={post.fields.slug}>
                  <article
                    className="post-list-item"
                    itemScope
                    itemType="http://schema.org/Article"
                  >
                    <header>
                      <h2>
                        <Link to={post.fields.slug} itemProp="url">
                          <span itemProp="headline">{title}</span>
                        </Link>
                      </h2>
                      <small>{post.frontmatter.date}</small>
                    </header>
                    <section>
                      <p
                        dangerouslySetInnerHTML={{
                          __html: post.frontmatter.description || post.excerpt,
                        }}
                        itemProp="description"
                      />
                    </section>
                  </article>
                </li>
              )
            })}
          </ol>
          <Pagination
            page={posts.pageInfo.currentPage}
            hidePrevButton={!posts.pageInfo.hasPreviousPage}
            hideNextButton={!posts.pageInfo.hasNextPage}
            count={posts.pageInfo.pageCount}
            onChange={handlePageChange}
          />
        </article>
      </Layout>
    </div>
  )
}

export const Head = ({ data: { post } }) => {
  return (
    <Seo
      title={post.frontmatter.title}
      description={post.frontmatter.description || post.excerpt}
    />
  )
}

export default IndexPostTemplate

export const pageQuery = graphql`
  query BlogPostByCategory(
    $id: String!
    $slug: String!
    $categoriesList: [String]
    $skip: Int
    $limit: Int
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
          algoliaProps {
            indexName
          }
        }
      }
    }
    post: mdx(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      fields {
        slug
      }
      frontmatter {
        title
        category {
          name
          index
          depth
        }
        tags
        comments
        description
      }
    }
    posts: allMdx(
      filter: {
        fields: { slug: { ne: $slug } }
        frontmatter: {
          index: { ne: true }
          category: { name: { in: $categoriesList } }
        }
      }
      sort: [
        {
          frontmatter: {
            date: DESC
          }
        }
        {
          frontmatter: {
            category: {
              index: ASC
            }
          }
        }
      ]
      skip: $skip
      limit: $limit
    ) {
      nodes {
        id
        excerpt(pruneLength: 160)
        fields {
          slug
        }
        frontmatter {
          title
          date(formatString: "DD-MMM-YYYY")
          description
        }
      }
      pageInfo {
        currentPage
        hasNextPage
        hasPreviousPage
        itemCount
        pageCount
        perPage
        totalCount
      }
    }
  }
`
