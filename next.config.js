const withMDX = require('@next/mdx')({
    extension: /\.mdx$/,
    options: {
        remarkPlugins: [
            "remark-html-katex",
            "remark-math",
            "remark-parse"
        ],
        rehypePlugins: []
    }
})

module.exports = withMDX({
    pageExtensions: ['js', 'jsx', 'mdx', 'md']
})