import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, "src");

// regras de correção
const replacements = [
  { from: /text-subtitle-1/g, to: "text-h6" },
  { from: /text-subtitle-2/g, to: "text-h6" },
];

// pega arquivos vue recursivamente
function getVueFiles(dir) {
  let results = [];

  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getVueFiles(fullPath));
    } else if (file.endsWith(".vue")) {
      results.push(fullPath);
    }
  });

  return results;
}

function processFile(filePath, dryRun = false) {
  const content = fs.readFileSync(filePath, "utf8");
  let updated = content;

  replacements.forEach(({ from, to }) => {
    updated = updated.replace(from, to);
  });

  if (updated !== content) {
    console.log(`\n🟡 ${filePath}`);

    replacements.forEach(({ from }) => {
      const matches = (content.match(from) || []).length;
      if (matches > 0) {
        console.log(`   - ${from} → ${matches} ocorrência(s)`);
      }
    });

    if (!dryRun) {
      fs.writeFileSync(filePath + ".bak", content, "utf8");
      fs.writeFileSync(filePath, updated, "utf8");
      console.log("   ✔ aplicado");
    } else {
      console.log("   👀 dry-run (sem alterações)");
    }
  }
}

function run() {
  const dryRun = process.argv.includes("--dry-run");

  const files = getVueFiles(ROOT_DIR);

  console.log(`🔍 Analisando ${files.length} arquivos Vue...`);
  console.log(dryRun ? "🧪 Modo DRY-RUN ativado\n" : "⚡ Modo EXECUÇÃO\n");

  files.forEach((file) => processFile(file, dryRun));

  console.log("\n✅ Finalizado");
}

run();