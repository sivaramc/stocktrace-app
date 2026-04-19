// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo so changes in packages/core hot-reload.
config.watchFolders = [workspaceRoot];

// Resolve modules against both the app's node_modules and the workspace root's
// node_modules (so hoisted deps are found).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Disable hoisting-related symlink confusion; Metro 0.80+ handles this well,
// but disabling hierarchical lookup prevents picking up unrelated node_modules.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
