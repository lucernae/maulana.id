# Comprehensive Agent Harness for maulana.id

**Last Updated**: 2026-03-14
**Project Type**: Personal Blog & Knowledge Base
**Primary Tech Stack**: Astro, React, MDX, TypeScript
**Repository**: https://github.com/lucernae/maulana.id
**Live Site**: https://maulana.id

---

## Table of Contents

1. [Quick Start for AI Agents](#quick-start-for-ai-agents)
2. [Project Overview](#project-overview)
3. [Agent Types & Entry Points](#agent-types--entry-points)
4. [Directory Map](#directory-map)
5. [Knowledge Map](#knowledge-map)
6. [Quick Reference](#quick-reference)
7. [Maintenance](#maintenance)

---

## Quick Start for AI Agents

### Project Overview

**maulana.id** is a personal blog and knowledge base covering:
- **Mathematics & Physics** (40+ articles): Fourier series, quantum mechanics, calculus
- **Software Development** (30+ articles): Nix, DevOps, Astro migration, system administration
- **LLM Topics** (3+ articles): Local LLM deployment, Qwen, DeepSeek, model optimization
- **Interactive Sandboxes** (2+ articles): Pyodide, WebGL demonstrations

**Key Characteristics:**
- Math-heavy content with KaTeX rendering
- Interactive components (Python execution, data visualization)
- Static site generation with Astro
- TypeScript-first codebase
- Nix-based reproducible development environment

### Critical Paths

| Path | Purpose |
|------|---------|
| `/home/lucernae/WorkingDir/personal/maulana.id/site/src/content/` | All blog content (MDX files) |
| `/home/lucernae/WorkingDir/personal/maulana.id/site/src/components/` | React/Astro components |
| `/home/lucernae/WorkingDir/personal/maulana.id/site/astro.config.mjs` | Astro configuration |
| `/home/lucernae/WorkingDir/personal/maulana.id/.harness/` | Agent knowledge base |
| `/home/lucernae/WorkingDir/personal/maulana.id/.harness/guidelines.md` | Development guidelines |

---

## Agent Types & Entry Points

### 1. Content Agent (Writing, Reviewing, Editing)

**Purpose**: Create, review, and improve blog content

**Responsibilities**:
- Draft new blog posts
- Review existing articles for grammar, typos, technical accuracy
- Maintain conversational tone while ensuring correctness
- Ensure proper KaTeX math formatting
- Validate frontmatter schema compliance

**Entry Points**:
- **Prompt**: `.harness/prompts/article-review.md` (existing)
- **Knowledge**: `.harness/knowledge/content-structure.md`
- **Pattern**: `.harness/patterns/mdx-frontmatter.md`

**Key Skills**:
- MDX syntax
- KaTeX math rendering
- Frontmatter schema (Zod validation)
- Content naming conventions
- Category system understanding

---

### 2. Development Agent (Coding, Features, Bugs)

**Purpose**: Implement features, refactor code, fix bugs

**Responsibilities**:
- Add new Astro/React components
- Implement features
- Fix bugs
- Refactor code while maintaining patterns
- Update dependencies safely

**Entry Points**:
- **Guidelines**: `.harness/guidelines.md`
- **Knowledge**: `.harness/knowledge/architecture.md`
- **Patterns**: Future file (see FUTURE_ENHANCEMENTS.md)

**Key Skills**:
- Astro Islands architecture
- TypeScript strict mode
- Path aliases (`@/components/`, `@/utils`)
- Tailwind CSS
- Component patterns

---

### 3. Testing Agent

**Purpose**: Write tests, validate functionality

**Responsibilities**:
- Create Vitest tests for utilities
- Test complex logic and edge cases
- Validate build process
- Ensure type safety

**Entry Points**:
- **Guidelines**: `.harness/guidelines.md#testing-information`
- **Testing Setup**: Vitest configuration in `site/vitest.config.ts`

**Key Skills**:
- Vitest syntax (not Jest)
- Testing utilities and pure functions
- Type-safe test writing

---

### 4. DevOps Agent

**Purpose**: Handle deployment, environment setup, dependencies

**Responsibilities**:
- Manage Nix environment
- Update dependencies
- Monitor CI/CD (GitHub Actions)
- Handle Netlify deployments
- Environment variable management

**Entry Points**:
- **Guidelines**: `.harness/guidelines.md`
- **Deployment**: Future file (see FUTURE_ENHANCEMENTS.md)

**Key Skills**:
- Nix flakes
- Netlify configuration
- GitHub Actions
- Dependency management (Yarn)

---

## Directory Map

### Content Organization

```
site/src/content/
├── blog/           # Mathematics & Physics articles (~40 posts)
│   ├── 2014--12--XX--XX--fourier-series-part-1/
│   ├── 2015--01--XX--XX--fourier-series-part-2/
│   └── ...
├── soft-dev/       # Software development tutorials (~30 posts)
│   ├── 2021--XX--XX--XX--setting-up-k3s-longhorn/
│   ├── 2025--09--06--00--migrating-from-gatsbyjs-to-astro/
│   └── ...
├── llm/            # LLM experiments & notes (~3 posts)
│   ├── 2024--07--07--00--llm-notes-01-setting-up-jupyter-with-nix/
│   ├── 2025--01--29--00--setting-up-deepseek-r1-using-ollama-and-nix/
│   └── 2026--03--02--00--running-qwen-3-5/
├── sandbox/        # Interactive demos (~2 posts)
│   ├── pyodide/
│   └── webgl/
└── index/          # Landing page content
```

**Content Naming Convention**: `YYYY--MM--DD--NN--slug-title/index.mdx` or `YYYY--MM--DD--NN--slug-title.mdx`
- Year, month, day with double dashes
- Two-digit sequence number for same-day posts
- Kebab-case slug
- Can be directory with `index.mdx` or standalone file

---

### Component Architecture

```
site/src/components/
├── BaseHead.astro          # SEO metadata, fonts, analytics
├── Header.astro            # Site navigation header
├── Footer.astro            # Site footer
├── BlogPost.astro          # Main blog post layout
├── BlogPostMeta.astro      # Post metadata (date, reading time)
├── TableOfContents.astro   # Auto-generated TOC
├── Pagination.astro        # Page navigation
├── RelatedPosts.astro      # Related content suggestions
├── Category.astro          # Category label/link
├── Tag.astro               # Tag label/link
├── Giscus.astro            # GitHub Discussions comments
├── Code.astro              # Syntax-highlighted code blocks
├── mdx/                    # MDX-specific components
│   ├── python-runner.jsx   # Pyodide Python execution
│   ├── geogebra.jsx        # GeoGebra math visualizations
│   └── fit.jsx             # Garmin FIT file visualization
└── icons/                  # SVG icon components
```

---

### Key Configuration Files

| File | Purpose | Agent Impact |
|------|---------|--------------|
| [site/astro.config.mjs](../site/astro.config.mjs) | Astro configuration | Remark/rehype plugins, MDX integration, site settings |
| [site/src/content/config.ts](../site/src/content/config.ts) | Content schema (Zod) | Frontmatter validation rules |
| [site/src/data/categories.ts](../site/src/data/categories.ts) | Category definitions | Must match content category values |
| [site/src/data/site.config.ts](../site/src/data/site.config.ts) | Site metadata | Author, social links, comments, analytics |
| [site/tsconfig.json](../site/tsconfig.json) | TypeScript config | Path aliases, strict mode settings |
| [flake.nix](../flake.nix) | Nix development environment | Dev dependencies, shell commands |
| [netlify.toml](../netlify.toml) | Deployment config | Build command, publish directory |
| [.gitignore](../.gitignore) | Git ignored files | Build outputs, dependencies, env files |

---

## Knowledge Map

### Technical Stack

#### Core Technologies

**1. Astro 4.16.4** - Static Site Generator
- **Islands Architecture**: Partial hydration for interactive components
- **MDX Integration**: Markdown with JSX components
- **TypeScript Support**: Strict type checking enabled
- **Build Output**: Static HTML + minimal JavaScript

**2. React 18** - Interactive Components
- Used sparingly for client-side interactivity
- Emotion for CSS-in-JS (some components)
- MUI X-Charts for data visualization
- Hydrated as "islands" only when needed

**3. MDX** - Enhanced Markdown
- Custom remark plugins:
  - `remark-math` - Parse math syntax
  - `remark-math-headings` - Allow KaTeX in headings
  - Reading time calculation
  - Mermaid diagram support
- Custom rehype plugins:
  - `rehype-katex` - Render math equations
  - Syntax highlighting with Shiki
  - Table of contents generation

**4. Mathematics & Science Stack**
- **KaTeX**: Math rendering (config: `strict: false, throwOnError: false`)
  - Inline: `$equation$`
  - Block: `$$equation$$`
- **Pyodide**: Python 3.x in browser via WebAssembly
- **Plotly.js**: Interactive charts and data visualization
- **MathJS**: Client-side mathematical computations
- **GeoGebra**: Embedded math visualizations

**5. Development Environment**
- **Nix with Flakes**: Reproducible dev environment
- **TypeScript**: Strict null checks, no implicit any
- **Vitest**: Testing framework (not Jest)
- **ESLint + Prettier**: Code quality
- **Husky + lint-staged**: Pre-commit hooks
- **TinaCMS**: Optional headless CMS

**6. Styling & UI**
- **Tailwind CSS**: Utility-first styling
- **Typography Plugin**: Enhanced prose styling
- **Custom Theme**: Defined in tailwind.config.cjs
- **Responsive Design**: Mobile-first approach

---

### Content Patterns

#### Frontmatter Schema (Zod Validation)

From `site/src/content/config.ts`:

```typescript
{
  title: string (max 80 chars) [REQUIRED]
  description: string [OPTIONAL, recommended for SEO]
  index: boolean [default: false] - Is this an index/landing page?
  date: string | Date [OPTIONAL] - Legacy date field
  pubDate: string | Date [OPTIONAL] - Publication date (auto-transformed to Date)
  heroImage: Image [OPTIONAL] - Cover image
  category: CategoryEnum | string | CategoryObject [REQUIRED]
    // Can be: 'all' | 'blog' | 'soft-dev' | 'llm' | 'sandbox'
    // Or object: { name: string, index?: number, depth?: number }
  tags: string[] [default: []]
  layout_name: string [OPTIONAL] - Override default layout
  comments: boolean [default: siteConfig.config.commentsEnabled]
  draft: boolean [default: false] - Hide from production
  features: string[] [default: []] - Special features to enable
}
```

#### Category Definitions

From `site/src/data/categories.ts`:

1. **all** - Meta-category (shows all posts)
2. **blog** - Math, physics, theoretical content
3. **soft-dev** - Programming, DevOps, tools, tutorials
4. **llm** - LLM experiments, local inference, model notes
5. **sandbox** - Interactive demos, experiments

#### Content Best Practices

1. **Title**: Descriptive, under 80 characters, can include KaTeX
2. **Description**: SEO-friendly summary (recommended)
3. **Date Format**: ISO 8601 string or Date object
4. **Category**: Must match one of the defined categories
5. **Tags**: 3-5 relevant tags for discoverability
6. **Hero Image**: Relative path from content directory
7. **Draft Mode**: Set `draft: true` to hide from production

---

### Development Workflows

#### Local Development

```bash
# Enter Nix environment (recommended)
nix develop

# Install dependencies
yarn install

# Start dev server with TinaCMS
yarn dev

# Start dev server without TinaCMS
yarn start

# Build for production
yarn build

# Preview production build
yarn preview

# Run tests
cd site && yarn test

# Run tests in watch mode
cd site && yarn test:watch

# Lint code
yarn lint

# Format code
yarn format

# Check formatting
yarn format:check
```

#### Content Creation Workflow

1. **Create MDX file** in appropriate category directory
   - Example: `site/src/content/blog/2026--03--14--00--my-new-post.mdx`
2. **Add frontmatter** with required fields (title, category)
3. **Write content** using MDX syntax
   - Use KaTeX for math: `$inline$` or `$$block$$`
   - Import components: `import Component from '@/components/Component.astro'`
4. **Preview locally**: `yarn start` and visit `http://localhost:3000`
5. **Validate**: Check for Zod validation errors in console
6. **Commit and push**: Netlify auto-deploys from main branch

#### Component Development Workflow

1. **Create component file**:
   - Astro: `site/src/components/MyComponent.astro`
   - React: `site/src/components/MyComponent.jsx` or `.tsx`
2. **Use TypeScript** for type safety
3. **Follow existing patterns** (check similar components)
4. **Import with path alias**:
   ```typescript
   import MyComponent from '@/components/MyComponent'
   ```
5. **Test locally** in a sample page
6. **Use Tailwind** for styling

#### Testing Workflow

1. **Create test file**: `fileName.test.ts` or `fileName.spec.ts`
2. **Co-locate** with source or place in `site/tests/`
3. **Use Vitest syntax**:
   ```typescript
   import { describe, it, expect } from 'vitest'

   describe('MyFunction', () => {
     it('should do something', () => {
       expect(myFunction()).toBe(expectedValue)
     })
   })
   ```
4. **Run tests**: `yarn test`
5. **Watch mode**: `yarn test:watch`

---

### Deployment & CI/CD

#### Automated Deployment (Netlify)

**Trigger**: Push to `main` branch

**Build Process**:
1. Netlify pulls latest code
2. Runs build command: `cd site && pnpm build`
3. Astro generates static site to `site/dist/`
4. Pagefind indexes for search: `pagefind --site dist`
5. Publishes to CDN

**Configuration**: `netlify.toml`
- Build command: `cd site && pnpm build`
- Publish directory: `site/dist`
- Node version: 20

**Environment Variables**:
- `PUBLIC_SITE_URL`: https://maulana.id
- Analytics IDs (Google Analytics, Giscus)

#### GitHub Actions

**Workflow**: `.github/workflows/build.yaml`

**Triggers**:
- Push to `main` or `develop`
- Pull requests
- Manual workflow dispatch

**Matrix Testing**:
- nixos-unstable with Yarn

**Steps**:
1. Checkout code
2. Install Nix
3. Enable Nix caching
4. Run build in Nix environment
5. Report status

---

### Path Aliases

Configured in `site/tsconfig.json`:

```typescript
{
  "@/components/*": "src/components/*",
  "@/layouts/*": "src/layouts/*",
  "@/utils": "src/utils/index.ts",
  "@/data/*": "src/data/*",
  "@/site-config": "src/data/site.config.ts"
}
```

**Usage**:
```typescript
// Instead of: import { foo } from '../../../utils'
import { foo } from '@/utils'

// Instead of: import Component from '../../components/Component.astro'
import Component from '@/components/Component.astro'
```

---

## Quick Reference

### Important Commands

| Command | Purpose |
|---------|---------|
| `yarn dev` | Start dev server with TinaCMS |
| `yarn start` | Start dev server without TinaCMS |
| `yarn build` | Production build |
| `yarn preview` | Preview production build |
| `yarn test` | Run Vitest tests |
| `yarn test:watch` | Run tests in watch mode |
| `yarn lint` | Run ESLint |
| `yarn format` | Format with Prettier |
| `yarn format:check` | Check formatting |
| `nix develop` | Enter Nix dev environment |
| `nix flake lock --update` | Update Nix flake dependencies |

### File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Content | `YYYY--MM--DD--NN--kebab-case-title.mdx` | `2026--03--14--00--my-blog-post.mdx` |
| Components (Astro) | `PascalCase.astro` | `BlogPost.astro` |
| Components (React) | `camelCase.jsx` or `PascalCase.tsx` | `pythonRunner.jsx` |
| Utilities | `camelCase.ts` | `formatDate.ts` |
| Tests | `fileName.test.ts` | `formatDate.test.ts` |
| Config | `kebab-case.config.ts` | `site.config.ts` |

### Common Patterns

**Astro Component**:
```astro
---
interface Props {
  title: string
  description?: string
}

const { title, description } = Astro.props
---

<div class="component-wrapper">
  <h2 class="text-2xl font-bold">{title}</h2>
  {description && <p class="text-gray-600">{description}</p>}
</div>
```

**MDX Frontmatter**:
```yaml
---
title: "My Blog Post Title"
description: "A brief description for SEO"
pubDate: 2026-03-14T00:00:00.00Z
category: blog
tags: [math, physics, fourier]
heroImage: ./cover.png
comments: true
draft: false
---
```

**Math Rendering**:
```markdown
Inline math: $E = mc^2$

Block math:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

---

## Agent Guidelines

### General Principles

1. **Explore First**: Always read existing code before making changes
2. **Follow Patterns**: Check similar files for established patterns
3. **Maintain Consistency**: Match naming conventions, code style, structure
4. **Test Thoroughly**: Run tests, preview builds before finalizing
5. **Document Changes**: Update knowledge base if patterns change
6. **Type Safety**: Use TypeScript types, avoid `any`
7. **Performance**: Prefer Astro components, use React only when needed
8. **Accessibility**: Use semantic HTML, ARIA labels where appropriate

### Content Agent Guidelines

**Tone**: Conversational but technically accurate (per `.harness/prompts/article-review.md`)

**Checklist**:
- ✅ Fix grammar and typos
- ✅ Maintain original voice
- ✅ Validate math equations (KaTeX compatible)
- ✅ Ensure frontmatter is valid (Zod schema)
- ✅ Appropriate post length for topic depth
- ✅ Include description for SEO
- ✅ Add relevant tags

### Development Agent Guidelines

**Code Quality**:
- ✅ TypeScript strict types (no `any`)
- ✅ Prefer Astro components for static content
- ✅ Use React only for interactivity
- ✅ Import with path aliases (`@/components/*`)
- ✅ Tailwind CSS utility classes
- ✅ Semantic HTML elements
- ✅ ARIA labels for accessibility

**File Organization**:
- ✅ Components in `src/components/`
- ✅ Utilities in `src/utils/`
- ✅ Layouts in `src/layouts/`
- ✅ Data in `src/data/`
- ✅ Tests co-located or in `tests/`

### Testing Agent Guidelines

**Framework**: Vitest (NOT Jest)

**What to Test**:
- ✅ Utility functions (pure functions)
- ✅ Data transformations
- ✅ Complex calculations
- ✅ Content processing logic
- ❌ Simple components
- ❌ Third-party wrappers

**Test Quality**:
- ✅ Descriptive test names
- ✅ Edge cases covered
- ✅ Error conditions tested
- ✅ Fast execution (< 100ms per test)

### DevOps Agent Guidelines

**Environment**:
- ✅ Prefer Nix for reproducibility
- ✅ Use Yarn for dependency management
- ✅ Test builds locally before committing
- ❌ Never commit secrets or API keys

**Deployment**:
- ✅ Ensure builds succeed locally
- ✅ Check Netlify deploy previews
- ✅ Monitor build logs for errors
- ✅ Validate environment variables

---

## Maintenance

### Keeping Knowledge Current

**Update Triggers**:

**Immediate** (same day):
- Architecture changes
- New categories added
- Major dependency upgrades (Astro, React)
- Breaking changes in APIs

**Regular** (monthly):
- Review for outdated info
- Update version numbers
- Add newly discovered patterns

**As Needed**:
- Common issues identified
- New workflows established
- Performance optimizations documented

### Update Process

1. **Identify** what changed in codebase
2. **Update** affected files in `.harness/knowledge/`
3. **Verify** AGENTS.md reflects current structure
4. **Test** with fresh agent session
5. **Commit** with descriptive message:
   - `docs(harness): update astro version to 4.17`
   - `docs(harness): add new content pattern for video embeds`

### Knowledge Base Audit Schedule

- **Monthly**: Review all knowledge files for accuracy
- **After major releases**: Update architecture, tech versions
- **When onboarding**: Test with fresh agent to find gaps

---

## Resources

### External Documentation

- [Astro Documentation](https://docs.astro.build/)
- [MDX Documentation](https://mdxjs.com/)
- [KaTeX Supported Functions](https://katex.org/docs/support_table.html)
- [Vitest Documentation](https://vitest.dev/)
- [Nix Flakes](https://nixos.wiki/wiki/Flakes)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Internal References

- **Development Guidelines**: `.harness/guidelines.md`
- **Architecture Overview**: `.harness/knowledge/architecture.md`
- **Content Structure**: `.harness/knowledge/content-structure.md`
- **Frontmatter Patterns**: `.harness/patterns/mdx-frontmatter.md`
- **Future Enhancements**: `.harness/FUTURE_ENHANCEMENTS.md`

### Project Information

- **Repository**: https://github.com/lucernae/maulana.id
- **Live Site**: https://maulana.id
- **Author**: Rizky Maulana Nugraha (@lucernae)
- **License**: GPL-3.0-only

---

## Future Phases

This is Phase 1 implementation. For information about future enhancements (Phases 2-5), see:

📖 **[.harness/FUTURE_ENHANCEMENTS.md](.harness/FUTURE_ENHANCEMENTS.md)**

Future phases will add:
- Additional prompts (content-creation, code-review, testing, refactoring, debugging)
- More knowledge files (technologies, workflows, deployment, troubleshooting)
- Pattern templates (component-templates, math-rendering, interactive-demos)
- Checklists (new-post, feature-add, dependency-update, pre-deploy)
- Reference examples (sample blog post, component, test)

---

**Last Updated**: 2026-03-14
**Version**: 1.0 (Phase 1)
**Maintained By**: AI Agents & Project Contributors
