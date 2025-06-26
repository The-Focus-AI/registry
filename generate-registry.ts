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

// Function to convert simple markdown to HTML
function markdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

// Function to get README content for a component
function getComponentReadme(item: any): string | null {
  // First try to find the README based on the file paths in the component
  const firstFilePath = item.files?.[0]?.path;
  if (firstFilePath) {
    // Extract the component directory from the file path
    // e.g., "components/cli/mise.toml" -> "cli"
    const pathParts = firstFilePath.split('/');
    if (pathParts.length >= 2 && pathParts[0] === 'components') {
      const componentDir = pathParts[1];
      const readmePath = path.join(componentsDir, componentDir, 'README.md');
      if (fs.existsSync(readmePath)) {
        return fs.readFileSync(readmePath, 'utf-8');
      }
    }
  }
  
  // Fallback to using the component name directly
  const readmePath = path.join(componentsDir, item.name, 'README.md');
  if (fs.existsSync(readmePath)) {
    return fs.readFileSync(readmePath, 'utf-8');
  }
  
  return null;
}

const componentHtml = items.map((item: any) => {
  const name = escapeHtml(item.title || item.name || '');
  const description = escapeHtml(item.description || '');
  const installUrl = `https://registry.thefocus.ai/r/${encodeURIComponent(item.name)}.json`;
  const installCmd = `npx shadcn@latest add ${installUrl}`;
  
  // Check for README.md in the component directory
  const readmeContent = getComponentReadme(item);
  let readmeHtml = '';
  
  if (readmeContent) {
    const processedMarkdown = markdownToHtml(escapeHtml(readmeContent));
    readmeHtml = `
      <div class="component-readme">
        <div class="readme-toggle" onclick="toggleReadme('${item.name}')">
          📖 View Documentation
        </div>
        <div class="readme-content" id="readme-${item.name}" style="display: none;">
          <div>${processedMarkdown}</div>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="component">
      <div class="component-title">${name}</div>
      <div class="component-description">${description}</div>
      <div class="install-command">${installCmd}</div>${readmeHtml}
    </div>
  `;
}).join('\n');

const indexHtml = indexTemplate.replace('<!-- COMPONENT_LIST -->', componentHtml);
fs.writeFileSync(outputIndexPath, indexHtml);

console.log(`Wrote ${items.length} components to registry.json and index.html`); 