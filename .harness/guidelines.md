# Development Guidelines for maulana.id

This document provides essential information for developers working on the maulana.id project. It covers build/configuration instructions, testing procedures, and other development-specific details.

## Build/Configuration Instructions

### Prerequisites

- Node.js (version specified in `.nvmrc`, currently Node 20)
- Yarn or pnpm (the project supports both)
- Nix (optional, for reproducible development environments)

### Environment Setup

#### Using Nix (Recommended)

The project includes Nix configuration for a reproducible development environment:

```bash
# If you have Nix with flakes enabled
nix develop

# Or using the legacy approach
nix-shell
```

#### Without Nix

```bash
# Install dependencies at the root level
yarn install

# Or using pnpm in the site directory
cd site
pnpm install
```

### Development Workflow

```bash
# Start the development server with TinaCMS
yarn dev

# Or without TinaCMS
yarn start

# Build the site
yarn build

# Preview the built site
yarn preview
```

### Environment Variables

The project uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
# Example .env configuration
PUBLIC_SITE_URL=https://maulana.id
```

## Testing Information

### Testing Framework

The project uses Vitest for unit testing. The test configuration is in `site/vitest.config.ts`.

### Running Tests

```bash
# Run tests once
cd site
yarn test

# Run tests in watch mode
yarn test:watch
```

### Adding New Tests

1. Create test files with the `.test.ts` or `.test.tsx` extension
2. Place them in the `site/tests` directory or alongside the files they test
3. Follow the existing test patterns using Vitest's syntax

### Example Test

Here's a simple example of a test for utility functions:

```typescript
// math.test.ts
import { describe, it, expect } from 'vitest';
import { add } from '../src/utils/math';

describe('Math Utilities', () => {
  describe('add function', () => {
    it('should add two numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
    });
  });
});
```

## Additional Development Information

### Project Structure

- `site/`: Main Astro project
  - `src/`: Source code
    - `components/`: Reusable UI components
    - `content/`: Blog posts and other content (MDX files)
    - `layouts/`: Page layouts
    - `pages/`: Astro pages
    - `utils/`: Utility functions
  - `public/`: Static assets
  - `tests/`: Test files

### Content Management

The project uses TinaCMS for content management. To work with content:

1. Start the development server with TinaCMS: `yarn dev`
2. Access the CMS at `http://localhost:3000/admin`

### Styling

The project uses Tailwind CSS for styling. The configuration is in `site/tailwind.config.cjs`.

### Deployment

The site is configured for deployment on Netlify. The configuration is in `netlify.toml`.

### Code Style and Linting

- The project uses ESLint for linting and Prettier for code formatting
- Run `yarn lint` to check for linting issues
- Run `yarn format` to automatically format code
- Pre-commit hooks are set up with Husky to ensure code quality

### Performance Considerations

- The site uses Astro's static site generation for optimal performance
- Images should be optimized before adding them to the project
- Use the built-in performance tools in the browser to identify bottlenecks