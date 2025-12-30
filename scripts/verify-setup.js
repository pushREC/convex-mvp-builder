#!/usr/bin/env node

/**
 * Setup Verification Script
 *
 * Run with: npm run setup:verify
 *
 * Checks that all required configuration is in place before running the app.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ENV_FILE = path.join(ROOT, ".env.local");

const checks = [];
let hasErrors = false;

function check(name, condition, fix) {
  if (condition) {
    checks.push({ name, status: "PASS", fix: null });
  } else {
    checks.push({ name, status: "FAIL", fix });
    hasErrors = true;
  }
}

function getNodeMajorVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split(".")[0], 10);
  return major;
}

// Check 1: Node version
const nodeVersion = getNodeMajorVersion();
check(
  "Node.js version >= 20",
  nodeVersion >= 20,
  `Current: v${process.version}. Install Node 20+: https://nodejs.org/`
);

// Check 2: .env.local exists
const envExists = fs.existsSync(ENV_FILE);
check(
  ".env.local file exists",
  envExists,
  "Run: cp .env.example .env.local"
);

// Check 3: NEXT_PUBLIC_CONVEX_URL is set
let convexUrl = null;
if (envExists) {
  try {
    const envContent = fs.readFileSync(ENV_FILE, "utf-8");
    const match = envContent.match(/NEXT_PUBLIC_CONVEX_URL=(.+)/);
    convexUrl = match ? match[1].trim() : null;
  } catch {
    convexUrl = null;
  }
}
check(
  "NEXT_PUBLIC_CONVEX_URL is set",
  convexUrl && convexUrl.length > 0 && !convexUrl.startsWith("#"),
  "Run: npx convex dev (this will populate the URL automatically)"
);

// Check 4: node_modules exists
const nodeModulesExists = fs.existsSync(path.join(ROOT, "node_modules"));
check(
  "Dependencies installed",
  nodeModulesExists,
  "Run: npm install"
);

// Check 5: Convex folder exists (indicates project is linked)
const convexFolderExists = fs.existsSync(path.join(ROOT, "convex"));
check(
  "Convex folder exists",
  convexFolderExists,
  "Ensure you're in the correct project directory"
);

// Output results
console.log("\n" + "=".repeat(60));
console.log("  SETUP VERIFICATION");
console.log("=".repeat(60) + "\n");

for (const { name, status, fix } of checks) {
  const icon = status === "PASS" ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
  console.log(`  ${icon} ${name}`);
  if (fix) {
    console.log(`    \x1b[33m→ ${fix}\x1b[0m`);
  }
}

console.log("\n" + "=".repeat(60));

if (hasErrors) {
  console.log("  \x1b[31mSetup incomplete. Fix the issues above.\x1b[0m");
  console.log("=".repeat(60) + "\n");
  process.exit(1);
} else {
  console.log("  \x1b[32mAll checks passed! Ready to run: npm run dev\x1b[0m");
  console.log("=".repeat(60) + "\n");
  process.exit(0);
}
