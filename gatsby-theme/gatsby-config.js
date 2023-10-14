/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

// Patch from https://www.gatsbyjs.com/plugins/gatsby-plugin-mdx#mdxoptions
const wrapESMPlugin = name =>
  function wrapESM(opts) {
    return async (...args) => {
      const mod = await import(name)
      const plugin = mod.default(opts)
      return plugin(...args)
    }
  }

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = ({
  contentPath = `${__dirname}/content`,
  assetPath = `${__dirname}/content/assets`,
}) => ({
  siteMetadata: {
    title: `Maulana's Gatsby Theme`,
    author: {
      name: `Rizky Maulana Nugraha`,
      summary: `Software Developer. Currently remotely working from Indonesia.`,
    },
    description: `Personal blog theme.`,
    siteUrl: `https://gatsby-starter.maulana.id/`,
    social: {
      twitter: `maulana_pcfre`,
      github: `lucernae`,
    },
    config: {
      categoryNameForAll: "all",
      paginationPageSize: 10,
      contentPath: contentPath,
      assetPath: assetPath,
    },
  },
  plugins: [
    `gatsby-plugin-mdx-embed`,
    `gatsby-plugin-image`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [
          {
            resolve: require.resolve(`${__dirname}/plugins/gatsby-remark-mermaid-client`)
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          // Ignored because the plugin doesn't work
          {
            resolve: `gatsby-remark-katex`,
            options: {
              strict: `ignore`,
            },
          },
          `gatsby-remark-autolink-headers`,
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
        mdxOptions: {
          remarkPlugins: [
            require(`remark-gfm`),
            // require(`remark-math`),
            // wrapESMPlugin(`remark-frontmatter`),
            // wrapESMPlugin(`remark-mdx-frontmatter`),
            // [require(`remark-html-katex`), {strict: "ignore"}],
          ],
          // rehypePlugins: [
          //   require(`rehype-katex`),
          // ],
        },
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Gatsby Starter Blog`,
        short_name: `Gatsby`,
        start_url: `/`,
        background_color: `#ffffff`,
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        // theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `content/assets/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `${__dirname}/src/utils/typography`,
      },
    },
    `gatsby-plugin-postcss`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
})
