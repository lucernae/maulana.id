# MDX Frontmatter Patterns

**Last Updated**: 2026-03-14
**Purpose**: Complete frontmatter schema reference with examples and validation rules

---

## Table of Contents

1. [Frontmatter Schema](#frontmatter-schema)
2. [Field Reference](#field-reference)
3. [Examples by Category](#examples-by-category)
4. [Validation Rules](#validation-rules)
5. [Common Patterns](#common-patterns)
6. [Troubleshooting](#troubleshooting)

---

## Frontmatter Schema

### Complete Zod Schema

From `site/src/content/config.ts`:

```typescript
const post = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string().max(80),
    description: z.string().optional(),
    index: z.boolean().default(false),
    date: z.string().or(z.date()).optional(),
    pubDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional(),
    heroImage: image().optional(),
    category: z
      .enum(['all', 'blog', 'soft-dev', 'llm', 'sandbox'])
      .or(z.string())
      .or(z.object({
        name: z.string(),
        index: z.number().optional(),
        depth: z.number().optional()
      })),
    tags: z.array(z.string()).default([]),
    layout_name: z.string().optional(),
    comments: z.boolean().default(siteConfig.config.commentsEnabled),
    draft: z.boolean().default(false),
    features: z.array(z.string()).default([])
  })
})
```

### Minimal Valid Frontmatter

```yaml
---
title: "Post Title"
category: blog
---
```

---

## Field Reference

### Required Fields

#### `title`
- **Type**: `string`
- **Max Length**: 80 characters
- **Required**: ✅ Yes
- **Description**: Post title (can include KaTeX math)
- **Validation**: Must be present and ≤ 80 characters

**Examples**:
```yaml
title: "Understanding Fourier Series"
title: "Integration of $\\int x dx$"  # KaTeX supported
title: "Setting Up Nix with Flakes"
```

**Invalid**:
```yaml
title: "This is a very long title that exceeds the eighty character maximum limit and will fail validation because it's too long"  # TOO LONG
title: ""  # EMPTY
```

---

#### `category`
- **Type**: `string | CategoryEnum | CategoryObject`
- **Required**: ✅ Yes
- **Valid Values**: `'all' | 'blog' | 'soft-dev' | 'llm' | 'sandbox'`
- **Description**: Content category (must match CATEGORIES)

**Examples**:
```yaml
# Simple string
category: blog

# String alternative
category: soft-dev

# Object form (advanced)
category:
  name: blog
  index: 1
  depth: 2
```

**Invalid**:
```yaml
category: invalid-category  # Not in CATEGORIES
category: programming  # Use 'soft-dev' instead
```

---

### Recommended Fields

#### `description`
- **Type**: `string`
- **Required**: ⭕ Optional (but highly recommended)
- **Description**: SEO description, social media preview text
- **Best Practice**: 120-160 characters for SEO

**Examples**:
```yaml
description: "A comprehensive guide to Fourier series from first principles, covering theory and practical examples."
description: "Step-by-step tutorial for setting up reproducible development environments using Nix flakes."
```

---

#### `pubDate`
- **Type**: `string | Date` (transformed to `Date`)
- **Required**: ⭕ Optional (but recommended for blog posts)
- **Format**: ISO 8601 date string
- **Description**: Publication date

**Examples**:
```yaml
pubDate: 2026-03-14T00:00:00.00Z  # Full ISO format
pubDate: 2026-03-14  # Date only (will be parsed)
pubDate: 2026-03-14T14:30:00+07:00  # With timezone
```

**Invalid**:
```yaml
pubDate: 14/03/2026  # Wrong format
pubDate: March 14, 2026  # Wrong format
```

---

#### `tags`
- **Type**: `string[]`
- **Required**: ⭕ Optional
- **Default**: `[]`
- **Description**: Tags for discoverability and filtering
- **Best Practice**: 3-5 relevant tags

**Examples**:
```yaml
tags: [math, fourier, calculus, series]
tags: [nix, devops, flakes, tutorial]
tags: [llm, ollama, local-inference, qwen]
```

**Formatting Alternatives**:
```yaml
# Array format
tags: [tag1, tag2, tag3]

# Multi-line format
tags:
  - tag1
  - tag2
  - tag3
```

---

### Optional Fields

#### `heroImage`
- **Type**: `Image` (Astro image type)
- **Required**: ⭕ Optional
- **Description**: Cover image for post
- **Path**: Relative to content file

**Examples**:
```yaml
heroImage: ./cover.png
heroImage: ./images/header-illustration.jpg
heroImage: ../shared-assets/default-hero.png
```

---

#### `comments`
- **Type**: `boolean`
- **Required**: ⭕ Optional
- **Default**: `true` (from `siteConfig.config.commentsEnabled`)
- **Description**: Enable/disable Giscus comments for this post

**Examples**:
```yaml
comments: true   # Enable comments
comments: false  # Disable comments
```

---

#### `draft`
- **Type**: `boolean`
- **Required**: ⭕ Optional
- **Default**: `false`
- **Description**: Hide post from production builds

**Examples**:
```yaml
draft: true   # Hide in production
draft: false  # Show in production (default)
```

**Use Cases**:
- Work-in-progress posts
- Scheduled future posts
- Posts pending review

---

#### `features`
- **Type**: `string[]`
- **Required**: ⭕ Optional
- **Default**: `[]`
- **Description**: Enable special features for this post
- **Valid Values**: `['python-runner', 'geogebra', 'plotly', ...]`

**Examples**:
```yaml
features: [python-runner]  # Enable Pyodide
features: [geogebra, plotly]  # Multiple features
```

---

#### `layout_name`
- **Type**: `string`
- **Required**: ⭕ Optional
- **Default**: Uses default layout
- **Description**: Override default layout template

**Examples**:
```yaml
layout_name: blog-post  # Explicit layout
layout_name: custom-layout  # Custom layout
```

---

#### `index`
- **Type**: `boolean`
- **Required**: ⭕ Optional
- **Default**: `false`
- **Description**: Mark as index/landing page

**Examples**:
```yaml
index: true   # This is an index page
index: false  # Regular post (default)
```

---

#### `date` (Legacy)
- **Type**: `string | Date`
- **Required**: ⭕ Optional
- **Description**: Legacy date field (use `pubDate` instead)
- **Note**: Kept for backward compatibility

---

## Examples by Category

### Blog Post (Math/Physics)

```yaml
---
title: "Understanding the Fourier Transform"
description: "A comprehensive guide to the Fourier transform, from theory to practical applications in signal processing."
pubDate: 2026-03-14T00:00:00.00Z
category: blog
tags: [math, fourier, signal-processing, calculus]
heroImage: ./fourier-visualization.png
comments: true
draft: false
---
```

---

### Software Development Tutorial

```yaml
---
title: "Setting Up K3s with Longhorn Storage"
description: "Complete tutorial for deploying Kubernetes K3s cluster with Longhorn distributed storage on bare metal."
pubDate: 2025-06-15T00:00:00.00Z
category: soft-dev
tags: [kubernetes, k3s, longhorn, devops, storage]
heroImage: ./k3s-architecture.svg
comments: true
draft: false
---
```

---

### LLM Experiment

```yaml
---
title: "Running Qwen-3.5 Locally: Performance Benchmarks"
description: "Comprehensive guide to running Qwen-3.5 locally with performance benchmarks across M2, M4, and GTX 1080 hardware."
pubDate: 2026-03-02T00:00:00.00Z
category: llm
tags: [llm, qwen, local-inference, ollama, benchmarks]
heroImage: ./qwen-performance-chart.png
comments: true
draft: false
features: [plotly]
---
```

---

### Interactive Sandbox

```yaml
---
title: "Interactive Python in the Browser with Pyodide"
description: "Run Python code directly in your browser using Pyodide WebAssembly. No server required!"
pubDate: 2024-08-20T00:00:00.00Z
category: sandbox
tags: [python, pyodide, webassembly, interactive]
heroImage: ./pyodide-demo.png
comments: true
draft: false
features: [python-runner]
---
```

---

### Landing Page / Index

```yaml
---
title: "Blog Posts"
description: "Mathematics, physics, and theoretical explorations"
index: true
category:
  name: blog
  index: 0
comments: false
---
```

---

### Series Post (Multi-Part)

```yaml
---
title: "Fourier Series - Part 3: Convergence Properties"
description: "Part 3 of the Fourier series tutorial: Understanding convergence, Gibbs phenomenon, and practical implications."
pubDate: 2015-03-15T00:00:00.00Z
category: blog
tags: [math, fourier, series, convergence, part-3]
heroImage: ./gibbs-phenomenon.png
comments: true
draft: false
---
```

---

## Validation Rules

### Title Validation

✅ **Valid**:
```yaml
title: "Short Title"  # 12 chars
title: "This is exactly eighty characters long and will pass the validation rules!"  # 80 chars
title: "Math: $E = mc^2$"  # KaTeX allowed
```

❌ **Invalid**:
```yaml
title: ""  # Empty
title: "This title is way too long and exceeds the maximum allowed length of eighty characters, which will cause a validation error"  # > 80 chars
```

---

### Category Validation

✅ **Valid**:
```yaml
category: blog
category: soft-dev
category: llm
category: sandbox
category:
  name: blog
  index: 1
```

❌ **Invalid**:
```yaml
category: invalid
category: programming  # Use 'soft-dev'
category: ai  # Use 'llm'
```

---

### Date Validation

✅ **Valid**:
```yaml
pubDate: 2026-03-14T00:00:00.00Z
pubDate: 2026-03-14
pubDate: 2026-03-14T14:30:00+07:00
```

❌ **Invalid**:
```yaml
pubDate: 14/03/2026
pubDate: March 14, 2026
pubDate: 2026-3-14  # Month and day must be zero-padded
```

---

### Tags Validation

✅ **Valid**:
```yaml
tags: []
tags: [math]
tags: [math, physics, fourier, calculus, series]
tags:
  - kubernetes
  - devops
  - tutorial
```

❌ **Invalid**:
```yaml
tags: math  # Must be array, not string
tags: [123]  # Must be strings, not numbers
```

---

### Boolean Validation

✅ **Valid**:
```yaml
draft: true
draft: false
comments: true
index: false
```

❌ **Invalid**:
```yaml
draft: yes  # Must be true/false
draft: "true"  # Must be boolean, not string
comments: 1  # Must be boolean, not number
```

---

## Common Patterns

### Pattern 1: Standard Blog Post

```yaml
---
title: "Your Post Title Here"
description: "Brief SEO-friendly description (120-160 characters recommended)"
pubDate: 2026-03-14T00:00:00.00Z
category: blog
tags: [tag1, tag2, tag3, tag4]
heroImage: ./cover.png
---
```

---

### Pattern 2: Tutorial with Code

```yaml
---
title: "How to Set Up XYZ"
description: "Step-by-step tutorial for setting up XYZ with best practices"
pubDate: 2026-03-14T00:00:00.00Z
category: soft-dev
tags: [tutorial, setup, xyz, devops]
heroImage: ./tutorial-preview.png
comments: true
---
```

---

### Pattern 3: Draft/WIP Post

```yaml
---
title: "Work in Progress: Advanced Topic"
description: "This post is still being written"
pubDate: 2026-03-14T00:00:00.00Z
category: blog
tags: [wip]
draft: true  # Hidden from production
comments: false
---
```

---

### Pattern 4: Interactive Demo

```yaml
---
title: "Interactive Demo: Data Visualization"
description: "Explore interactive data visualizations with Plotly"
pubDate: 2026-03-14T00:00:00.00Z
category: sandbox
tags: [interactive, visualization, plotly]
features: [plotly, python-runner]
heroImage: ./demo-screenshot.png
---
```

---

### Pattern 5: Math-Heavy Post

```yaml
---
title: "Derivation of $\\int e^{-x^2} dx = \\sqrt{\\pi}$"
description: "Complete derivation of the Gaussian integral using polar coordinates"
pubDate: 2026-03-14T00:00:00.00Z
category: blog
tags: [math, calculus, integration, gaussian]
heroImage: ./gaussian-curve.png
---
```

---

## Troubleshooting

### Error: "title must be at most 80 characters"

**Problem**: Title exceeds 80 character limit

**Solution**: Shorten the title
```yaml
# Before
title: "This is an extremely long title that provides way too much detail and exceeds the maximum allowed length"

# After
title: "Concise Title Covering the Main Topic"
```

---

### Error: "Invalid enum value"

**Problem**: Category not in allowed list

**Solution**: Use valid category
```yaml
# Before
category: programming

# After
category: soft-dev
```

---

### Error: "Expected date, received string"

**Problem**: Invalid date format

**Solution**: Use ISO 8601 format
```yaml
# Before
pubDate: March 14, 2026

# After
pubDate: 2026-03-14T00:00:00.00Z
```

---

### Error: "Expected array, received string"

**Problem**: Tags is not an array

**Solution**: Wrap in brackets
```yaml
# Before
tags: math

# After
tags: [math]
```

---

### Warning: Missing description

**Problem**: No description for SEO

**Solution**: Add description
```yaml
---
title: "My Post"
description: "Brief summary for search engines and social media"  # Add this
category: blog
---
```

---

## Best Practices

### 1. SEO Optimization

✅ **Do**:
- Always include `description` (120-160 chars)
- Use descriptive `title` (under 80 chars)
- Add 3-5 relevant `tags`
- Include `heroImage` for social sharing
- Use semantic keywords in description

❌ **Don't**:
- Leave `description` empty
- Use generic titles ("Post 1", "Test")
- Overload with tags (>7 tags)
- Use clickbait titles

---

### 2. Accessibility

✅ **Do**:
- Write descriptive titles
- Include alt text in heroImage (via image element)
- Use clear, concise descriptions

❌ **Don't**:
- Use emoji-only titles
- Skip descriptions
- Use ambiguous titles

---

### 3. Organization

✅ **Do**:
- Use consistent date format
- Follow naming conventions
- Group related posts with tags
- Use drafts for WIP content

❌ **Don't**:
- Mix date formats
- Publish incomplete drafts
- Use random tags

---

**Last Updated**: 2026-03-14
**Related Documents**:
- [Content Structure](../knowledge/content-structure.md)
- [Architecture Overview](../knowledge/architecture.md)
- [AGENTS.md](../AGENTS.md)
