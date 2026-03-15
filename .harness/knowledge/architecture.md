# System Architecture Overview

**Last Updated**: 2026-03-14
**Purpose**: Comprehensive overview of maulana.id system architecture

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Astro Islands Architecture](#astro-islands-architecture)
3. [Content Collection Structure](#content-collection-structure)
4. [Build Pipeline](#build-pipeline)
5. [Component Hierarchy](#component-hierarchy)
6. [Plugin Architecture](#plugin-architecture)
7. [Data Flow](#data-flow)
8. [Deployment Architecture](#deployment-architecture)

---

## High-Level Architecture

maulana.id is a **statically generated blog** using Astro's Islands architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Static HTML │  │ Interactive  │  │   Search     │      │
│  │   + Styles   │  │   Islands    │  │  (Pagefind)  │      │
│  │   (Astro)    │  │   (React)    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ CDN (Netlify)
                           │
┌─────────────────────────────────────────────────────────────┐
│                  BUILD PROCESS (Netlify)                    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. MDX Content → Astro Processing                   │  │
│  │  2. Remark/Rehype Plugins (Math, Syntax, TOC)        │  │
│  │  3. Component Rendering (Astro + React Islands)      │  │
│  │  4. Static Site Generation                           │  │
│  │  5. Pagefind Search Indexing                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ Git Push
                           │
┌─────────────────────────────────────────────────────────────┐
│               SOURCE CODE (GitHub)                          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Content   │  │  Components │  │    Config   │        │
│  │  (MDX)      │  │ (Astro/React)│  │  (TS/JS)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Key Principles**:
- **Static-First**: Generate HTML at build time for performance
- **Partial Hydration**: Only hydrate interactive components
- **Content-Driven**: MDX files drive page generation
- **Type-Safe**: TypeScript + Zod validation throughout

---

## Astro Islands Architecture

Astro uses **Islands Architecture** for optimal performance:

### What is an Island?

An "island" is an interactive UI component on an otherwise static page. Islands are:
- Hydrated independently
- Loaded with appropriate priority
- Isolated from each other

### Implementation in maulana.id

**Static Components** (Most of the site):
- `BlogPost.astro` - Main post layout
- `Header.astro` - Site navigation
- `Footer.astro` - Site footer
- `TableOfContents.astro` - TOC generation
- `Code.astro` - Syntax highlighting

**Interactive Islands** (Selective hydration):
- `Giscus.astro` - Comments (client:load)
- `python-runner.jsx` - Python execution (client:visible)
- Chart components - Data visualization (client:idle)

### Hydration Directives

```astro
<!-- Load immediately -->
<Component client:load />

<!-- Load when visible -->
<PythonRunner client:visible />

<!-- Load when browser idle -->
<Chart client:idle />

<!-- Load on media query -->
<MobileMenu client:media="(max-width: 768px)" />
```

---

## Content Collection Structure

Astro Content Collections provide type-safe content management:

```
site/src/content/
├── config.ts           # Zod schema definitions
└── post/              # Single collection for all content
    ├── blog/          # Category subdirectory
    ├── soft-dev/      # Category subdirectory
    ├── llm/           # Category subdirectory
    ├── sandbox/       # Category subdirectory
    └── index/         # Landing pages
```

### Content Collection Schema

Defined in `site/src/content/config.ts`:

```typescript
const post = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string().max(80),
    description: z.string().optional(),
    index: z.boolean().default(false),
    pubDate: z.string().or(z.date()).transform((val) => new Date(val)),
    heroImage: image().optional(),
    category: z.enum(['all', 'blog', 'soft-dev', 'llm', 'sandbox']) | ...,
    tags: z.array(z.string()).default([]),
    layout_name: z.string().optional(),
    comments: z.boolean().default(true),
    draft: z.boolean().default(false),
    features: z.array(z.string()).default([])
  })
})
```

### Content Retrieval

```typescript
import { getCollection } from 'astro:content'

// Get all posts
const allPosts = await getCollection('post')

// Filter by category
const blogPosts = allPosts.filter(post =>
  post.data.category === 'blog' ||
  post.data.category.name === 'blog'
)

// Exclude drafts
const publishedPosts = allPosts.filter(post => !post.data.draft)

// Sort by date
const sortedPosts = publishedPosts.sort((a, b) =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
)
```

---

## Build Pipeline

### Step-by-Step Build Process

```
1. SOURCE FILES (MDX + Components)
   │
   ├─ Read MDX frontmatter → Zod validation
   │
2. CONTENT PROCESSING
   │
   ├─ Remark plugins (markdown → markdown AST)
   │  ├─ remark-math (parse math syntax)
   │  ├─ remark-math-headings (KaTeX in headings)
   │  ├─ remark-reading-time (calculate reading time)
   │  └─ remark-mermaid (diagram support)
   │
   ├─ Rehype plugins (HTML AST → HTML)
   │  ├─ rehype-katex (render math equations)
   │  ├─ rehype-autolink-headings (add heading links)
   │  └─ rehype-toc (generate table of contents)
   │
3. COMPONENT RENDERING
   │
   ├─ Astro components → Static HTML
   ├─ React components → Partial hydration
   └─ MDX components → Integrated rendering
   │
4. STATIC SITE GENERATION
   │
   ├─ Generate HTML pages
   ├─ Bundle JavaScript (minimal)
   ├─ Process CSS (Tailwind)
   ├─ Optimize images
   └─ Output to dist/
   │
5. POST-BUILD
   │
   ├─ Pagefind indexing (search)
   └─ Ready for deployment
```

### Build Configuration

**Astro Config** (`site/astro.config.mjs`):

```javascript
export default defineConfig({
  site: 'https://maulana.id',
  integrations: [
    mdx({
      remarkPlugins: [remarkMath, remarkMathHeadings, ...],
      rehypePlugins: [rehypeKatex, ...]
    }),
    react(),
    tailwind({ applyBaseStyles: false }),
    ...
  ],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
      wrap: true
    }
  }
})
```

---

## Component Hierarchy

### Page Structure

```
┌─────────────────────────────────────────────────┐
│                 BaseHead.astro                  │
│  (SEO, fonts, analytics, meta tags)             │
└─────────────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────────────┐
│              BlogPost.astro                     │
│  ┌────────────────────────────────────────┐    │
│  │         Header.astro                    │    │
│  │  (Site nav, logo, theme toggle)         │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │    BlogPostMeta.astro                   │    │
│  │  (Date, reading time, category, tags)   │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │    TableOfContents.astro                │    │
│  │  (Auto-generated from headings)         │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │         CONTENT (MDX)                   │    │
│  │  ┌──────────────────────────────────┐  │    │
│  │  │  Text, headings, lists           │  │    │
│  │  │  Code blocks (Code.astro)        │  │    │
│  │  │  Math equations (KaTeX)          │  │    │
│  │  │  Interactive islands (React)     │  │    │
│  │  └──────────────────────────────────┘  │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │      RelatedPosts.astro                 │    │
│  │  (Suggestions based on category/tags)   │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │         Giscus.astro                    │    │
│  │  (GitHub Discussions comments)          │    │
│  │  [client:load - interactive island]     │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │         Footer.astro                    │    │
│  │  (Copyright, links, social)             │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### Component Relationships

- **Layout Components** wrap pages
  - `BlogPost.astro` - Main blog layout
  - `BaseLayout.astro` - Base layout (if exists)

- **Structural Components** provide structure
  - `Header.astro` - Site header (navigation)
  - `Footer.astro` - Site footer

- **Content Components** enhance content
  - `Code.astro` - Syntax-highlighted code blocks
  - `TableOfContents.astro` - Generated TOC
  - `BlogPostMeta.astro` - Post metadata display

- **Interactive Components** (Islands)
  - `Giscus.astro` - Comments
  - `python-runner.jsx` - Python execution
  - Chart components - Data visualization

---

## Plugin Architecture

### Remark Plugins (Markdown Processing)

**Remark** operates on the markdown AST before HTML generation:

```javascript
// remark-math: Parse LaTeX math syntax
// Input: `$E = mc^2$`
// AST: { type: 'inlineMath', value: 'E = mc^2' }

// remark-math-headings: Allow math in headings
// Input: `## Integration of $\int x dx$`
// Allows KaTeX rendering in headings

// remark-reading-time: Calculate reading time
// Analyzes word count, adds to frontmatter
```

### Rehype Plugins (HTML Processing)

**Rehype** operates on the HTML AST:

```javascript
// rehype-katex: Render math to HTML
// Input: { type: 'inlineMath', value: 'E = mc^2' }
// Output: <span class="katex">...</span>

// rehype-autolink-headings: Add heading anchors
// Input: <h2>Title</h2>
// Output: <h2 id="title"><a href="#title">Title</a></h2>

// rehype-toc: Generate table of contents
// Extracts headings, creates TOC structure
```

### Plugin Configuration

```javascript
// astro.config.mjs
integrations: [
  mdx({
    remarkPlugins: [
      remarkMath,
      remarkMathHeadings,
      remarkReadingTime
    ],
    rehypePlugins: [
      [rehypeKatex, {
        strict: false,
        throwOnError: false
      }],
      rehypeAutolinkHeadings,
      rehypeToc
    ]
  })
]
```

---

## Data Flow

### Content Rendering Flow

```
1. USER REQUEST
   │
   └─> Route: /blog/my-post
         │
2. ASTRO ROUTING
   │
   └─> Match: src/pages/[...slug].astro
         │
3. CONTENT COLLECTION QUERY
   │
   └─> getEntry('post', 'blog/2026--03--14--00--my-post')
         │
         ├─ Read frontmatter (validated by Zod)
         ├─ Read MDX content
         │
4. MDX PROCESSING
   │
   └─> remark plugins → rehype plugins
         │
5. COMPONENT RENDERING
   │
   ├─ Astro components → Static HTML
   ├─ React islands → Hydration markers
   └─ Inject frontmatter data
         │
6. HTML GENERATION
   │
   └─> Complete page HTML
         │
7. CLIENT DELIVERY
   │
   ├─ Static HTML (immediate render)
   ├─ CSS (Tailwind, inline critical)
   └─ JavaScript (islands, search)
```

### Build-time vs Runtime

**Build-time** (Static Generation):
- MDX parsing and transformation
- Remark/Rehype processing
- Component rendering
- Math equation rendering (KaTeX)
- Syntax highlighting
- Image optimization
- Search indexing (Pagefind)

**Runtime** (Client-side):
- Island hydration (React components)
- Comments loading (Giscus)
- Search functionality (Pagefind)
- Python execution (Pyodide)
- Interactive charts (Plotly)
- Theme switching

---

## Deployment Architecture

### Infrastructure

```
┌──────────────────────────────────────────────┐
│           GITHUB REPOSITORY                  │
│  - Source code (main branch)                 │
│  - CI/CD (GitHub Actions)                    │
└──────────────────────────────────────────────┘
                  │
                  │ Git Push
                  ▼
┌──────────────────────────────────────────────┐
│           NETLIFY BUILD                      │
│  1. Pull latest code                         │
│  2. Install dependencies (pnpm)              │
│  3. Build site (Astro)                       │
│  4. Index search (Pagefind)                  │
│  5. Deploy to CDN                            │
└──────────────────────────────────────────────┘
                  │
                  │ Deploy
                  ▼
┌──────────────────────────────────────────────┐
│           NETLIFY CDN                        │
│  - Static files (HTML, CSS, JS, images)     │
│  - Global distribution                       │
│  - HTTPS                                     │
│  - Custom domain (maulana.id)                │
└──────────────────────────────────────────────┘
                  │
                  │ HTTPS
                  ▼
┌──────────────────────────────────────────────┐
│              END USERS                       │
│  - Fast load times (CDN)                     │
│  - SEO-friendly (static HTML)                │
│  - Progressive enhancement                   │
└──────────────────────────────────────────────┘
```

### Environment Variables

**Public** (Available client-side):
- `PUBLIC_SITE_URL` - Site URL

**Private** (Build-time only):
- Analytics IDs
- Giscus configuration
- API keys (if any)

### Deployment Triggers

1. **Push to main** → Production deployment
2. **Pull request** → Preview deployment
3. **Manual trigger** → Redeploy

---

## Performance Considerations

### Optimization Strategies

1. **Static Generation**: Pre-render all pages at build time
2. **Partial Hydration**: Only interactive components load JavaScript
3. **Code Splitting**: Islands loaded independently
4. **Image Optimization**: Astro's built-in image optimization
5. **CSS Purging**: Tailwind removes unused styles
6. **Lazy Loading**: Images and heavy components load on demand
7. **CDN**: Global distribution via Netlify

### Performance Metrics

**Target** (Lighthouse):
- Performance: > 95
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

**Actual** (typical blog post):
- FCP (First Contentful Paint): < 1s
- LCP (Largest Contentful Paint): < 2.5s
- TTI (Time to Interactive): < 3s

---

## Security Considerations

1. **No Server-Side Code**: Static site = minimal attack surface
2. **Content Security Policy**: Configured in Netlify headers
3. **HTTPS**: Enforced by Netlify
4. **Dependency Updates**: Regular updates via Dependabot
5. **No Secrets in Code**: Environment variables for sensitive data

---

**Last Updated**: 2026-03-14
**Related Documents**:
- [Content Structure](./content-structure.md)
- [Guidelines](../guidelines.md)
- [AGENTS.md](../AGENTS.md)
