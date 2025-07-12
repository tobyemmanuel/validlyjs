# Installation

This guide will walk you through installing and setting up ValidlyJS in your project.

## Requirements

Before installing, make sure you have the following:

- Node.js 16 or higher
- npm 7+ or yarn 1.22+

## Installation Methods

### Using npm

```bash
npm install validlyjs
```

### Or via yarn

```bash
yarn add validlyjs
```

## Verify Installation

After installation, you can verify that the package is working correctly:

```javascript
import { version } from 'validlyjs';

console.log(`ValidlyJS version: ${version}`);
```

## TypeScript Support

ValidlyJS comes with built-in TypeScript definitions. No additional `@types` package is needed.

```typescript
import { ValidatorOptions } from 'validlyjs';

const config: ValidatorOptions = {
  // Your configuration here
};
```

## Troubleshooting

### Common Issues

**Issue**: Package not found after installation
**Solution**: Make sure you're importing from the correct package name and that the installation completed successfully.

**Issue**: TypeScript errors
**Solution**: Ensure you're using TypeScript 4.5 or higher and that your `tsconfig.json` includes the necessary compiler options.

### Getting Help

If you encounter any issues during installation:

1. Check our [GitHub Issues](https://github.com/yourusername/your-repo-name/issues) for similar problems
2. Create a new issue with your system information and error details
3. Join our community discussions for help from other users

## Next Steps

Now that you have ValidlyJS installed, you can:

- Explore the [API Reference](../api/overview) to learn about available functions
- Check out code examples in our repository
- Start building your first project with ValidlyJS

## Update Instructions

To update to the latest version:

```bash
npm update validlyjs
```

Always check the [changelog](https://github.com/yourusername/your-repo-name/releases) for breaking changes when updating.