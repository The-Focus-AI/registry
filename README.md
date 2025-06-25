# The Focus AI Registry

A public registry and website for [shadcn/ui](https://ui.shadcn.com/) components, designed to make it easy to discover, share, and install reusable UI blocks for your projects.

## What is this?

This project is a registry and static site generator for shadcn/ui components. It collects component definitions from the `components/` directory, generates a `registry.json` for programmatic use, and builds a modern website listing all available components with install instructions.

- **Website:** [registry.thefocus.ai](https://registry.thefocus.ai)
- **Registry JSON:** [registry.json](https://registry.thefocus.ai/registry.json)

## How it works

- Each component lives in its own subdirectory under `components/` and includes a `component.json` file with metadata (name, title, description, etc).
- The `generate-registry.ts` script collects all components, updates the registry, and builds a static site (`public/index.html`) listing all components and their install commands.
- The site is automatically deployed to GitHub Pages on every push to `main`.

## Usage

To add a component from this registry to your project:

```
npx shadcn@latest add https://registry.thefocus.ai/r/{component-name}.json
```

Replace `{component-name}` with the name of the component you want to install.

## Development

1. Clone the repo
2. Install dependencies:
   ```sh
   pnpm install
   ```
3. Build the registry and site:
   ```sh
   pnpm build
   ```
4. Add new components in the `components/` directory. Each should have a `component.json`.
5. Push to `main` to trigger deployment to GitHub Pages.

## Contributing

Contributions are welcome! Please open a pull request to add or update components, improve the site, or suggest new features.

## License

MIT
