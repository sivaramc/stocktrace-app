// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo so changes in packages/core hot-reload.
config.watchFolders = [workspaceRoot];

// Resolve modules against both the app's node_modules and the workspace root's
// node_modules (so hoisted deps are found). Hierarchical lookup is left enabled
// so Metro can find nested deps like react-native-reanimated's own copy of
// `semver` (used by its worklets-version validator on web).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];



module.exports = config;
