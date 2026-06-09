import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, "src");

const replacements = [
  // 📏 spacing polish
  { from: /mb-0/g, to: "mb-2" },

  // 🎯 icon spacing
  { from: /mr-1(?!\d)/g, to: "mr-2" },

  // 🧱 card elevation normalization
  { from: /elevation="\d+"/g, to: 'elevation="2"' },
];

function getVueFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getVueFiles(fullPath));
    } else if (file.endsWith(".vue")) {
      results.push(fullPath);
    }
  }

  return results;
}

function processFile(filePath, dryRun = false) {
  let original = fs.readFileSync(filePath, "utf8");
  let updated = original;

  for (const { from, to } of replacements) {
    updated = updated.replace(from, to);
  }

  // 🧠 adiciona hover básico se houver v-card e ainda não tiver hover CSS
  if (updated.includes("<v-card") && !updated.includes("v-card:hover")) {
    updated += `

<style scoped>
.v-card {
  transition: all 0.2s ease;
}
.v-card:hover {
  transform: translateY(-2px);
}
</style>
`;
  }

  if (updated !== original) {
    console.log(`\n🟡 ${filePath}`);

    if (!dryRun) {
      fs.writeFileSync(filePath + ".bak", original, "utf8");
      fs.writeFileSync(filePath, updated, "utf8");
      console.log("✔ aplicado");
    } else {
      console.log("👀 dry-run");
    }
  }
}

function run() {
  const dryRun = process.argv.includes("--dry-run");

  const files = getVueFiles(ROOT_DIR);

  console.log(`🔍 arquivos: ${files.length}`);
  console.log(dryRun ? "🧪 DRY-RUN\n" : "⚡ aplicando\n");

  files.forEach((f) => processFile(f, dryRun));

  console.log("\n✅ finalizado");
}

run();