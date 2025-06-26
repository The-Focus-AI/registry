# The Focus AI Registry

A public registry and website for [shadcn/ui](https://ui.shadcn.com/) components, designed to make it easy to discover, share, and install reusable UI blocks for your projects.

## What is this?

This project is a registry and static site generator for shadcn/ui components. It collects component definitions from the `components/` directory, generates a `registry.json` for programmatic use, and builds a modern website listing all available components with install instructions.

- **Website:** [registry.thefocus.ai](https://registry.thefocus.ai)
- **Registry JSON:** [registry.json](https://registry.thefocus.ai/registry.json)

## How it works

- Each component lives in its own subdirectory under `components/` and includes a `component.json` file with metadata (name, title, description, etc).
- Components can optionally include a `README.md` file for detailed documentation that will be displayed on the website.
- The `generate-registry.ts` script collects all components, updates the registry, and builds a static site (`public/index.html`) listing all components with their install commands and documentation.
- The site features interactive README toggles for components that include documentation.
- The site is automatically deployed to GitHub Pages on every push to `main`.

## Usage

To add a component from this registry to your project:

```
npx shadcn@latest add https://registry.thefocus.ai/r/{component-name}.json
```

Replace `{component-name}` with the name of the component you want to install.

## Component Management

We provide a comprehensive script for managing components in this registry.

### Adding Components

Use the `component_add` script to automatically create components from existing files:

```bash
# Add files to a new component
./component_add my-component file1.js file2.css src/utils.ts

# Add files with automatic README generation
./component_add --with-readme my-component file1.js file2.css
```

This will:
- Copy files to `components/my-component/` maintaining directory structure
- Create a `component.json` with proper registry metadata
- Update the main `registry.json`
- Optionally generate a template `README.md`

### Managing Existing Components

```bash
# List all components
./component_add --list

# Create README for existing component
./component_add --readme component-name

# Reset component files to original locations
./component_add --reset component-name
```

### Component Documentation

Components can include a `README.md` file for detailed documentation:

```
components/
└── my-component/
    ├── component.json
    ├── README.md          # Optional documentation
    └── [component files]
```

The README will be:
- Automatically detected and displayed on the website
- Rendered from Markdown to HTML with proper styling
- Shown/hidden via toggle buttons on the component listing
- Include syntax highlighting for code blocks

#### README Template Structure

Generated READMEs include:
- Component title and description
- List of included files
- Installation instructions
- Sections for description, configuration, and usage examples

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
4. Add new components using the `component_add` script or manually in the `components/` directory
5. Each component should have a `component.json` and optionally a `README.md`
6. Push to `main` to trigger deployment to GitHub Pages

## Scripts

### `component_add` - Component Management Script

A Node.js script for managing components in the registry.

**Full Usage:**
```bash
# Add component with files
./component_add <component_name> <file1> [file2] [file3] ...

# Add component with automatic README
./component_add --with-readme <component_name> <file1> [file2] ...

# Create README for existing component
./component_add --readme <component_name>

# Reset component files to original locations
./component_add --reset <component_name>

# List all components
./component_add --list

# Show help
./component_add --help
```

**Features:**
- Preserves directory structure when copying files
- Generates proper shadcn/ui registry metadata
- Stores original file paths for reset functionality
- Creates template README.md files with installation instructions
- Validates component names (lowercase, numbers, hyphens only)
- Updates main registry.json automatically

### `generate-registry.ts` - Site Generator

TypeScript script that builds the registry and static website.

**Usage:**
```bash
node generate-registry.ts
# or
pnpm build
```

**Features:**
- Scans `components/` directory for component.json files
- Generates consolidated `registry.json`
- Builds static HTML site with component listings
- Converts Markdown READMEs to HTML with syntax highlighting
- Creates interactive documentation toggles
- Handles component name/directory mismatches gracefully

**Markdown Support:**
- Headers (H1, H2, H3)
- Bold and italic text
- Code blocks with syntax highlighting
- Inline code formatting
- Links (open in new tabs)
- Proper paragraph and line break handling

## Contributing

Contributions are welcome! Please open a pull request to add or update components, improve the site, or suggest new features.

## License

MIT
