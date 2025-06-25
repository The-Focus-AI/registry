// If you see type errors for 'fs' or 'path', run: pnpm add -D @types/node
// This script is intended to be run with ts-node or after compiling with tsc in a Node.js environment.
// If using ES modules, __dirname is not defined, so we define it here:
import * as fs from 'fs';
import * as path from 'path';

// Polyfill __dirname for ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Directory containing components
const componentsDir = path.join(__dirname, 'components');
const registryTemplatePath = path.join(componentsDir, 'registry.template.json');
const outputRegistryPath = path.join(__dirname, 'registry.json');
const indexTemplatePath = path.join(componentsDir, 'index.template.html');
const outputIndexPath = path.join(__dirname, 'public', 'index.html');

// Helper to get all component.json files in subdirectories of components
function getComponentJsonFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Only look for component.json in subdirectories
      const componentJsonPath = path.join(fullPath, 'component.json');
      if (fs.existsSync(componentJsonPath) && fs.statSync(componentJsonPath).isFile()) {
        files.push(componentJsonPath);
      }
    }
  }
  return files;
}

// Load registry template
const registry = JSON.parse(fs.readFileSync(registryTemplatePath, 'utf-8'));

// Find all component.json files
const componentJsonFiles = getComponentJsonFiles(componentsDir);

// Load all component definitions
const items = componentJsonFiles.map((file) => JSON.parse(fs.readFileSync(file, 'utf-8')));

// Write items into registry
registry.items = items;

// Output to registry.json in root
fs.writeFileSync(outputRegistryPath, JSON.stringify(registry, null, 2));

// --- Generate index.html ---
const indexTemplate = fs.readFileSync(indexTemplatePath, 'utf-8');

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, function (tag) {
    const chars: { [key: string]: string } = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    };
    return chars[tag] || tag;
  });
}

const componentHtml = items.map((item: any) => {
  const name = escapeHtml(item.title || item.name || '');
  const description = escapeHtml(item.description || '');
  const installUrl = `https://registry.thefocus.ai/r/${encodeURIComponent(item.name)}.json`;
  const installCmd = `npx shadcn@latest add ${installUrl}`;
  return `
    <div class="component">
      <div class="component-title">${name}</div>
      <div class="component-description">${description}</div>
      <div class="install-command">${installCmd}</div>
    </div>
  `;
}).join('\n');

const indexHtml = indexTemplate.replace('<!-- COMPONENT_LIST -->', componentHtml);
fs.writeFileSync(outputIndexPath, indexHtml);

console.log(`Wrote ${items.length} components to registry.json and index.html`); 