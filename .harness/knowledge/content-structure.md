# Content Structure & Organization

**Last Updated**: 2026-03-14
**Purpose**: Complete guide to content organization, naming conventions, and structure patterns

---

## Table of Contents

1. [Content Directory Structure](#content-directory-structure)
2. [Naming Conventions](#naming-conventions)
3. [Category System](#category-system)
4. [Frontmatter Requirements](#frontmatter-requirements)
5. [Content Types](#content-types)
6. [Asset Management](#asset-management)
7. [Content Best Practices](#content-best-practices)

---

## Content Directory Structure

### Overview

All content lives in `site/src/content/post/` as a single Astro collection, organized by category subdirectories:

```
site/src/content/post/
├── blog/                      # Math & Physics articles (~40 posts)
│   ├── 2014--12--XX--XX--fourier-series-part-1/
│   │   ├── index.mdx
│   │   └── images/
│   ├── 2015--01--XX--XX--fourier-series-part-2.mdx
│   └── ...
├── soft-dev/                  # Software Development (~30 posts)
│   ├── 2021--XX--XX--XX--setting-up-k3s-longhorn/
│   │   └── index.mdx
│   ├── 2025--09--06--00--migrating-from-gatsbyjs-to-astro/
│   │   ├── index.mdx
│   │   └── screenshot.png
│   └── ...
├── llm/                       # LLM Experiments & Notes (~3 posts)
│   ├── 2024--07--07--00--llm-notes-01-setting-up-jupyter-with-nix/
│   ├── 2025--01--29--00--setting-up-deepseek-r1-using-ollama-and-nix/
│   └── 2026--03--02--00--running-qwen-3-5/
├── sandbox/                   # Interactive Demos (~2 posts)
│   ├── pyodide/
│   └── webgl/
└── index/                     # Landing/Index Pages
    ├── index.mdx
    ├── blog.mdx
    ├── soft-dev.mdx
    └── llm.mdx
```

### Content Count by Category

| Category | Count | Description |
|----------|-------|-------------|
| blog | ~40 | Mathematics, physics, theoretical content |
| soft-dev | ~30 | Programming, DevOps, system administration |
| llm | ~3 | LLM deployment, local inference, model notes |
| sandbox | ~2 | Interactive demonstrations, experiments |
| index | ~4 | Category landing pages |
| **Total** | **~79** | Published content pieces |

---

## Naming Conventions

### File/Directory Naming Pattern

All content follows a strict date-based naming convention:

```
YYYY--MM--DD--NN--kebab-case-slug
```

**Components**:
- `YYYY` - Four-digit year
- `MM` - Two-digit month (01-12)
- `DD` - Two-digit day (01-31) [or XX if day not specified]
- `NN` - Two-digit sequence number (00-99) for same-day posts
- `kebab-case-slug` - URL-friendly slug

**Examples**:
- `2026--03--14--00--my-blog-post` - First post on March 14, 2026
- `2026--03--14--01--another-post` - Second post on same day
- `2025--09--06--00--migrating-from-gatsbyjs-to-astro`

### File vs Directory Structure

Content can be organized two ways:

**1. Single File** (simpler):
```
2026--03--14--00--my-post.mdx
```

**2. Directory with Index** (preferred for posts with assets):
```
2026--03--14--00--my-post/
├── index.mdx
├── cover-image.png
├── diagram.svg
└── data/
    └── chart-data.json
```

**When to use directories**:
- Post has images
- Post has multiple assets
- Post has related data files
- Post uses local imports

**When to use single file**:
- Text-only posts
- Simple posts
- No local assets needed

---

## Category System

### Category Definitions

From `site/src/data/categories.ts`:

```typescript
export const CATEGORIES = [
  { title: 'All', slug: 'all' },          // Meta-category
  { title: 'Blogs', slug: 'blog' },       // Math & Physics
  { title: 'Software Development', slug: 'soft-dev' },
  { title: 'LLM', slug: 'llm' },
  { title: 'Sandbox', slug: 'sandbox' }
] as const
```

### Category Usage Guidelines

#### 1. **blog** - Mathematics & Physics

**Purpose**: Theoretical, mathematical, and physics content

**Examples**:
- Fourier series derivations
- Quantum mechanics explanations
- Calculus proofs
- Physics simulations
- Mathematical puzzles

**Characteristics**:
- Heavy use of KaTeX math rendering
- Often includes diagrams (Mermaid, GeoGebra)
- Educational/tutorial focus
- Rigorous mathematical content

#### 2. **soft-dev** - Software Development

**Purpose**: Programming, DevOps, system administration, tools

**Examples**:
- Framework migrations (GatsbyJS → Astro)
- Development environment setup (Nix, Docker)
- System administration guides
- Tool tutorials (Tailscale, YubiKey)
- Programming language features (Go generics)

**Characteristics**:
- Code-heavy content
- Step-by-step tutorials
- Configuration examples
- Troubleshooting guides

#### 3. **llm** - Large Language Models

**Purpose**: LLM deployment, experimentation, local inference

**Examples**:
- Setting up local LLM inference (Ollama, llama-cpp)
- Model deployment (Qwen, DeepSeek-R1)
- Performance benchmarks
- LLM integration tutorials

**Characteristics**:
- Technical deep dives
- Performance metrics
- Hardware considerations
- Recent/cutting-edge topics

#### 4. **sandbox** - Interactive Experiments

**Purpose**: Experimental, interactive demonstrations

**Examples**:
- Pyodide (Python in browser)
- WebGL demonstrations
- Interactive visualizations
- Proof-of-concept projects

**Characteristics**:
- Heavy use of interactive components
- Client-side code execution
- Experimental features
- May use `client:*` directives

---

## Frontmatter Requirements

### Complete Frontmatter Specification

See [.harness/patterns/mdx-frontmatter.md](../patterns/mdx-frontmatter.md) for detailed schema.

### Minimal Required Frontmatter

```yaml
---
title: "Post Title Here"
pubDate: 2026-03-14T00:00:00.00Z
category: blog
---
```

### Recommended Frontmatter

```yaml
---
title: "Post Title Here"
description: "Brief SEO-friendly description of the post"
pubDate: 2026-03-14T00:00:00.00Z
category: blog
tags: [math, fourier, calculus]
heroImage: ./cover.png
comments: true
draft: false
---
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string (max 80) | ✅ | Post title, can include KaTeX |
| `description` | string | ⭕ | SEO description, social media preview |
| `pubDate` | ISO date string | ⭕ | Publication date (recommended) |
| `category` | string/object | ✅ | Post category (must match CATEGORIES) |
| `tags` | string[] | ⭕ | Tags for discoverability |
| `heroImage` | Image | ⭕ | Cover image (relative path) |
| `comments` | boolean | ⭕ | Enable/disable comments (default: true) |
| `draft` | boolean | ⭕ | Hide from production (default: false) |
| `features` | string[] | ⭕ | Special features to enable |
| `layout_name` | string | ⭕ | Override default layout |
| `index` | boolean | ⭕ | Mark as index page (default: false) |

---

## Content Types

### 1. Standard Blog Posts

**Characteristics**:
- Text content with headings
- Code blocks with syntax highlighting
- Math equations (KaTeX)
- Images and diagrams
- Links and references

**Example Structure**:
```markdown
---
title: "Understanding Fourier Series"
description: "A comprehensive guide to Fourier series from first principles"
pubDate: 2026-03-14T00:00:00.00Z
category: blog
tags: [math, fourier, calculus, series]
heroImage: ./fourier-wave.png
---

# Introduction

Fourier series are fundamental in signal processing...

## Mathematical Foundation

The Fourier series of a function $f(x)$ is given by:

$$
f(x) = \frac{a_0}{2} + \sum_{n=1}^{\infty} \left( a_n \cos(nx) + b_n \sin(nx) \right)
$$

## Example

Let's compute the Fourier series of $f(x) = x$...

```python
import numpy as np

def fourier_coefficients(f, n):
    # Implementation
    pass
```

## Conclusion

...
```

---

### 2. Tutorial/Guide Posts

**Characteristics**:
- Step-by-step instructions
- Code examples
- Configuration files
- Troubleshooting sections
- Prerequisites and setup

**Example Structure**:
```markdown
---
title: "Setting Up Nix with Flakes"
description: "Step-by-step guide to setting up Nix with flakes for reproducible development"
pubDate: 2026-03-14T00:00:00.00Z
category: soft-dev
tags: [nix, devops, flakes, setup]
---

## Prerequisites

- Basic familiarity with command line
- macOS, Linux, or WSL

## Installation

### 1. Install Nix

```bash
sh <(curl -L https://nixos.org/nix/install)
```

### 2. Enable Flakes

...

## Common Issues

### Issue: Permission denied

**Solution**: ...
```

---

### 3. Interactive Demo Posts

**Characteristics**:
- Interactive components (Pyodide, Plotly)
- Client-side code execution
- Real-time visualizations
- User input handling

**Example Structure**:
```markdown
---
title: "Interactive Python in the Browser"
description: "Run Python code directly in your browser using Pyodide"
pubDate: 2026-03-14T00:00:00.00Z
category: sandbox
features: [python-runner]
---

import PythonRunner from '@/components/mdx/python-runner.jsx'

## Try It Yourself

<PythonRunner client:visible>
```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 10, 100)
y = np.sin(x)
plt.plot(x, y)
plt.show()
```
</PythonRunner>
```

---

### 4. Series/Multi-Part Posts

**Characteristics**:
- Related posts in sequence
- Cross-references between parts
- Consistent naming pattern
- Navigation between parts

**Naming Pattern**:
```
2015--01--XX--XX--fourier-series-part-1/
2015--02--XX--XX--fourier-series-part-2/
2015--03--XX--XX--fourier-series-part-3/
2015--04--XX--XX--fourier-series-part-4/
2015--05--XX--XX--fourier-series-part-5/
```

**Cross-References**:
```markdown
---
title: "Fourier Series - Part 2: Computing Coefficients"
description: "Part 2: Learning how to compute Fourier coefficients"
category: blog
tags: [math, fourier, series, part-2]
---

This is Part 2 of the Fourier Series tutorial.

- [Part 1: Introduction](../fourier-series-part-1/)
- **Part 2: Computing Coefficients** (you are here)
- [Part 3: Convergence](../fourier-series-part-3/)
```

---

## Asset Management

### Image Handling

**Placement**:
```
2026--03--14--00--my-post/
├── index.mdx
├── cover.png          # Hero image
├── diagram1.svg       # Inline image
└── screenshots/
    ├── step1.png
    └── step2.png
```

**Usage in MDX**:
```markdown
---
heroImage: ./cover.png
---

## Step 1

![Step 1 screenshot](./screenshots/step1.png)

## Diagram

![System architecture](./diagram1.svg)
```

**Best Practices**:
- Use relative paths (`./image.png`)
- Optimize images before committing
- Use appropriate formats (PNG for screenshots, SVG for diagrams)
- Include alt text for accessibility

### Data Files

**Placement**:
```
2026--03--14--00--data-visualization/
├── index.mdx
├── data/
│   └── chart-data.json
└── cover.png
```

**Usage**:
```javascript
import chartData from './data/chart-data.json'

<Chart data={chartData} client:visible />
```

---

## Content Best Practices

### 1. SEO Optimization

✅ **Do**:
- Include `description` in frontmatter
- Use descriptive `title` (under 80 chars)
- Add relevant `tags`
- Use `heroImage` for social previews
- Use semantic heading hierarchy (H1 → H2 → H3)

❌ **Don't**:
- Leave `description` empty
- Use overly long titles
- Skip heading levels (H2 → H4)
- Forget alt text for images

### 2. Content Organization

✅ **Do**:
- Use clear heading hierarchy
- Break content into sections
- Add table of contents for long posts
- Link to related posts
- Include code examples

❌ **Don't**:
- Write wall-of-text content
- Nest headings inconsistently
- Forget code syntax highlighting
- Leave broken links

### 3. Math Content

✅ **Do**:
- Use inline math for variables: `$x$`, `$y = mx + b$`
- Use block math for equations:
  ```
  $$
  \int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
  $$
  ```
- Escape special characters when needed
- Test rendering locally

❌ **Don't**:
- Use images for equations (use KaTeX)
- Forget dollar signs
- Use unsupported KaTeX syntax

### 4. Code Content

✅ **Do**:
- Specify language for syntax highlighting:
  ````markdown
  ```python
  def hello():
      print("Hello, World!")
  ```
  ````
- Keep code examples concise
- Include comments for clarity
- Test code before publishing

❌ **Don't**:
- Use generic code blocks without language
- Post long, uncommented code dumps
- Include broken or untested code

### 5. Accessibility

✅ **Do**:
- Use semantic HTML
- Include alt text for images
- Use descriptive link text
- Ensure proper heading hierarchy
- Test with screen readers

❌ **Don't**:
- Use "click here" links
- Forget image alt text
- Skip heading levels
- Use color alone for meaning

---

## Content Migration Notes

### From GatsbyJS (Historical)

The site was migrated from GatsbyJS to Astro in September 2025. Legacy content may have:
- Different file structure (flattened)
- Old frontmatter fields (converted)
- Different image handling (updated)

**Migration blog post**: `soft-dev/2025--09--06--00--migrating-from-gatsbyjs-to-astro/`

---

## Content Validation

### Zod Schema Validation

All frontmatter is validated at build time using Zod (see `site/src/content/config.ts`).

**Common Validation Errors**:

1. **Title too long**:
   ```
   Error: title must be 80 characters or less
   Fix: Shorten title to under 80 characters
   ```

2. **Invalid category**:
   ```
   Error: category must be one of: all, blog, soft-dev, llm, sandbox
   Fix: Use a valid category slug
   ```

3. **Invalid date format**:
   ```
   Error: pubDate must be a valid ISO date string
   Fix: Use format: 2026-03-14T00:00:00.00Z
   ```

### Pre-Publish Checklist

Before committing new content:

- [ ] Frontmatter valid (no Zod errors)
- [ ] Title under 80 characters
- [ ] Description present
- [ ] Category correct
- [ ] Tags relevant (3-5 tags)
- [ ] Hero image (optional but recommended)
- [ ] Math renders correctly (if applicable)
- [ ] Code blocks have language identifiers
- [ ] Links work (no 404s)
- [ ] Images optimized and load properly
- [ ] Preview locally (`yarn start`)
- [ ] No console errors

---

**Last Updated**: 2026-03-14
**Related Documents**:
- [MDX Frontmatter Patterns](../patterns/mdx-frontmatter.md)
- [Architecture Overview](./architecture.md)
- [Guidelines](../guidelines.md)
- [AGENTS.md](../AGENTS.md)
