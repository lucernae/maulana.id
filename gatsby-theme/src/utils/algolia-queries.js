const indexName = `Pages_${process.env.DEPLOY_ENVIRONMENT ?? 'testing'}`
const pageQuery = `{
  pages: allMdx {
    edges {
      node {
        id
        frontmatter {
          title
          tags
          category {
            name
          }
          description
        }
        fields {
          slug
        }
        excerpt(pruneLength: 5000)
      }
    }
  }
}`

function pageToAlgoliaRecord({ node: { id, frontmatter, fields, ...rest } }) {
  const doc = {
    objectID: id,
    ...frontmatter,
    ...fields,
    ...rest,
  }
  return doc
}

const queries = [
  {
    query: pageQuery,
    transformer: ({ data })=>  {
      return data.pages.edges.map(pageToAlgoliaRecord)
    },
    indexName,
    settings: { attributesToSnippet: [`excerpt:20`] },
  },
]

module.exports = queries