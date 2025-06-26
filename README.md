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

Use the `component_cli` script to automatically create components from existing files:

```bash
# Add files to a new component
./component_cli my-component file1.js file2.css src/utils.ts

# Add files with automatic README generation
./component_cli --with-readme my-component file1.js file2.css
```

This will:
- Copy files to `components/my-component/` maintaining directory structure
- Create a `component.json` with proper registry metadata
- Update the main `registry.json`
- Optionally generate a template `README.md`

### Managing Existing Components

```bash
# List all components
./component_cli --list

# Create README for existing component
./component_cli --readme component-name

# Reset component files to original locations
./component_cli --reset component-name
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

### Comparing and Updating Files from a Downstream Repo

You can check if any files in a component have changed in your downstream project, and optionally update the registry with new versions:

```bash
# Compare all files in the component
./component_cli --compare <component_name>

# Compare and update all files in the component
./component_cli --compare --update <component_name>

# Compare one or more specific files
./component_cli --compare <component_name> path/to/file1.ts path/to/file2.ts

# Compare and update one or more specific files (also adds them to the registry if new)
./component_cli --compare --update <component_name> path/to/file1.ts path/to/file2.ts
```

This makes it easy to keep your registry in sync with changes from downstream projects, or to add new files to a component's registry entry.

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
4. Add new components using the `component_cli` script or manually in the `components/` directory
5. Each component should have a `component.json` and optionally a `README.md`
6. Push to `main` to trigger deployment to GitHub Pages

## Scripts

### `component_cli` - Component Management Script

A Node.js script for managing components in the registry.

**Full Usage:**
```bash
# Add component with files
./component_cli <component_name> <file1> [file2] [file3] ...

# Add component with automatic README
./component_cli --with-readme <component_name> <file1> [file2] ...

# Create README for existing component
./component_cli --readme <component_name>

# Reset component files to original locations
./component_cli --reset <component_name>

# List all components
./component_cli --list

# Show help
./component_cli --help

# Compare registry files to originals in a downstream repo
./component_cli --compare <component_name>

# Compare and update all files in the component
./component_cli --compare <component_name> --update

# Compare a single file
./component_cli --compare <component_name> path/to/file.ts

# Compare and update a single file (also adds it to the registry if new)
./component_cli --compare <component_name> path/to/file.ts --update
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
