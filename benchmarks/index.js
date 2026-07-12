// Benchmark entry point. Runs the Jest-based performance benchmark so it executes in the
// same module-resolution environment as the test suite (no build step required).
const { execSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const benchmark = 'src/__tests__/benchmark/performance.test.ts';
const jestBin = path.join(root, 'node_modules', 'jest', 'bin', 'jest.js');
const cmd = `node "${jestBin}" ${benchmark} --silent=false`;

try {
  execSync(cmd, { stdio: 'inherit', cwd: root });
} catch (e) {
  process.exit(1);
}