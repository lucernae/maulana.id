# Agent Harness for maulana.id

**Last Updated**: 2026-03-14
**Project Type**: Personal Blog & Knowledge Base
**Primary Tech Stack**: Astro, React, MDX, TypeScript

## Quick Start for AI Agents

This project uses an Agent Harness structure to help AI assistants work effectively with the codebase.

### Essential Information

- **Project**: Personal blog covering math/physics, software development, and LLM topics
- **Built with**: Astro static site generator, using MDX for content
- **Content**: 84+ technical articles with interactive demonstrations
- **Repository**: https://github.com/lucernae/maulana.id

### For Comprehensive Documentation

See [.harness/AGENTS.md](.harness/AGENTS.md) for the complete knowledge map, including:
- Detailed project architecture
- Agent type definitions and workflows
- Directory structure and file organization
- Technology stack details
- Development patterns and best practices

## Agent Entry Points

### Content Agent (Writing, Reviewing, Editing)
**Purpose**: Create, review, and improve blog content

**Start here**:
- Prompt: [.harness/prompts/article-review.md](.harness/prompts/article-review.md)
- Knowledge: [.harness/knowledge/content-structure.md](.harness/knowledge/content-structure.md)
- Pattern: [.harness/patterns/mdx-frontmatter.md](.harness/patterns/mdx-frontmatter.md)

### Development Agent (Coding, Features, Bugs)
**Purpose**: Implement features, refactor code, fix bugs

**Start here**:
- Guidelines: [.harness/guidelines.md](.harness/guidelines.md)
- Knowledge: [.harness/knowledge/architecture.md](.harness/knowledge/architecture.md)
- Comprehensive guide: [.harness/AGENTS.md](.harness/AGENTS.md)

### Testing Agent
**Purpose**: Write tests, validate functionality

**Start here**:
- Guidelines: [.harness/guidelines.md#testing-information](.harness/guidelines.md#testing-information)
- Comprehensive guide: [.harness/AGENTS.md](.harness/AGENTS.md)

### DevOps Agent
**Purpose**: Handle deployment, environment setup, dependencies

**Start here**:
- Comprehensive guide: [.harness/AGENTS.md](.harness/AGENTS.md)

## Quick Commands

```bash
# Development
yarn start    # Start dev server (no CMS)
yarn dev      # Start dev server (with TinaCMS)
yarn build    # Production build
yarn test     # Run tests

# Code quality
yarn lint     # Run linters
yarn format   # Format code
```

## Environment Management

This repository uses **Nix flake** and **direnv** for reproducible, isolated development environments.

### Using direnv for Command Execution

When executing commands, prefer using `direnv exec` to ensure the correct environment is loaded:

```bash
# Preferred approach
direnv exec . yarn build
direnv exec . pnpm install
direnv exec . node scripts/something.js

# Instead of directly running
yarn build  # May not have all dependencies in PATH
```

### Adding Dependencies or Binaries

If you need to add a binary, tool, or create a reproducible platform-agnostic setup:

1. **Modify [flake.nix](flake.nix)** to include new dependencies
2. The flake defines all system-level dependencies (Node.js, Python, build tools, etc.)
3. Changes to `flake.nix` ensure reproducibility across different machines and platforms

**Example**: Adding a new tool to the development environment
```nix
# In flake.nix, add to buildInputs or nativeBuildInputs
buildInputs = [
  nodejs
  yarn
  python3
  # Add your tool here
];
```

### Why This Matters

- **Isolation**: Each project has its own environment, preventing conflicts
- **Reproducibility**: Same environment on all machines (Linux, macOS, etc.)
- **Declarative**: All dependencies defined in code, not installation steps

## Important Paths

- **Content**: `site/src/content/` (blog, soft-dev, llm, sandbox)
- **Components**: `site/src/components/`
- **Configuration**: `site/astro.config.mjs`, `site/src/content/config.ts`
- **Knowledge Base**: `.harness/knowledge/`
- **Patterns**: `.harness/patterns/`
- **Guidelines**: `.harness/guidelines.md`

## Critical Configuration Files

| File | Purpose |
|------|---------|
| `site/astro.config.mjs` | Astro configuration, plugins |
| `site/src/content/config.ts` | Content schema (Zod validation) |
| `site/src/data/categories.ts` | Category definitions |
| `site/src/data/site.config.ts` | Site metadata |

## Content Structure

Content is organized into 4 main categories:

1. **blog** (40+ posts) - Math & physics articles
2. **soft-dev** (30+ posts) - Software development tutorials
3. **llm** (3+ posts) - LLM experiments & notes
4. **sandbox** (2+ posts) - Interactive demos

**Naming convention**: `YYYY--MM--DD--NN--slug-title.mdx`

## Tech Stack Highlights

- **Astro 4.x** - Static site generator with Islands architecture
- **React 18** - For interactive components
- **MDX** - Markdown with JSX support
- **KaTeX** - Math rendering
- **Pyodide** - Python in browser
- **Plotly.js** - Interactive visualizations
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Styling
- **Vitest** - Testing
- **Nix** - Reproducible development environment

## Need More Information?

For detailed information about any aspect of this project, see:

📖 **[.harness/AGENTS.md](.harness/AGENTS.md)** - Comprehensive agent knowledge map

This file contains:
- Complete directory structure
- Detailed architecture overview
- Technology stack deep dive
- Development workflows
- Content patterns
- Testing procedures
- Deployment information

---

**Note**: The `.harness/` directory is symlinked to `.junie/` for backward compatibility. Both paths work identically.
