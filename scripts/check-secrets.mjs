import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();

const textExtensions = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".json", ".md", ".yml", ".yaml", ".txt", ".mjs"
]);

const allowedEnvFiles = new Set([".env.example"]);

const strictPatterns = [
  {
    name: "Forbidden VITE_GEMINI_API_KEY frontend usage",
    regex: /import\.meta\.env\.VITE_GEMINI_API_KEY/g
  },
  {
    name: "Forbidden hardcoded VITE_GEMINI_API_KEY assignment",
    regex: /VITE_GEMINI_API_KEY\s*=\s*["']?AIza[0-9A-Za-z_-]{20,}/g
  },
  {
    name: "Hardcoded Gemini key assignment",
    regex: /gemini[a-zA-Z0-9_]*\s*[:=]\s*["']AIza[0-9A-Za-z_-]{20,}["']/gi
  },
  {
    name: "Hardcoded key in Gemini endpoint URL",
    regex: /generativelanguage\.googleapis\.com\/v1beta\/[\s\S]{0,160}key=AIza[0-9A-Za-z_-]{20,}/gi
  }
];

const contextualKeyRegex = /AIza[0-9A-Za-z_-]{20,}/g;
const geminiContextRegex = /(gemini|generativelanguage|aistudio|google ai)/i;

function getTrackedFiles() {
  try {
    const output = execSync("git ls-files -z", { cwd: rootDir, stdio: ["ignore", "pipe", "ignore"] });
    return output
      .toString("utf8")
      .split("\0")
      .filter(Boolean)
      .map((relPath) => path.join(rootDir, relPath));
  } catch {
    return [];
  }
}

function isTextLikeFile(filePath) {
  const base = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (base.startsWith(".env")) return true;
  return textExtensions.has(ext);
}

function hasDisallowedTrackedEnvFile(relPath) {
  const base = path.basename(relPath);
  return base.startsWith(".env") && !allowedEnvFiles.has(base);
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }
    if (isTextLikeFile(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function checkFile(filePath) {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");
  if (!fs.existsSync(filePath)) return [];

  if (hasDisallowedTrackedEnvFile(relPath)) {
    return [{
      file: relPath,
      pattern: "Tracked env file detected",
      sample: "Remove from git and keep only .env.example tracked"
    }];
  }

  const content = fs.readFileSync(filePath, "utf8");
  const findings = [];
  const isSourceFile = relPath.startsWith("src/");

  for (const pattern of strictPatterns) {
    const matches = content.match(pattern.regex);
    if (matches && matches.length > 0) {
      findings.push({
        file: relPath,
        pattern: pattern.name,
        sample: matches[0]
      });
    }
  }

  if (isSourceFile) {
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      const keyMatch = line.match(contextualKeyRegex);
      if (!keyMatch) return;
      if (!geminiContextRegex.test(line)) return;

      findings.push({
        file: relPath,
        pattern: "Gemini-context key leak",
        sample: `line ${index + 1}: ${line.trim().slice(0, 120)}`
      });
    });
  }

  return findings;
}

const trackedFiles = getTrackedFiles().filter((filePath) => isTextLikeFile(filePath));
const distFiles = walkFiles(path.join(rootDir, "dist"));
const allFiles = [...new Set([...trackedFiles, ...distFiles])];
const allFindings = allFiles.flatMap((filePath) => checkFile(filePath));

if (allFindings.length > 0) {
  console.error("\n[SECURITY CHECK FAILED] Potential secrets found:\n");
  for (const finding of allFindings) {
    const maskedSample = finding.sample.replace(/AIza[0-9A-Za-z_-]{20,}/g, "AIza...masked...");
    console.error(`- ${finding.file} | ${finding.pattern} | ${maskedSample.slice(0, 140)}`);
  }
  console.error("\nDeployment stopped to avoid leaking API keys.");
  process.exit(1);
}

console.log("[SECURITY CHECK] No exposed API keys detected in tracked files.");
