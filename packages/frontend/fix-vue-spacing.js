import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, "src");

// regra simples de padronização
const replacements = [
  // excesso comum → padrão médio
  { from: /mb-0/g, to: "mb-2" },
  { from: /mb-1(?!\d)/g, to: "mb-2" },
  { from: /mb-3/g, to: "mb-4" },

  // padroniza variações pequenas de inconsistencia
  { from: /mt-0/g, to: "mt-2" },
  { from: /mt-1(?!\d)/g, to: "mt-2" },
  { from: /mt-3/g, to: "mt-4" },
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
  const original = fs.readFileSync(filePath, "utf8");
  let updated = original;

  for (const { from, to } of replacements) {
    updated = updated.replace(from, to);
  }

  if (updated !== original) {
    console.log(`\n🟡 ${filePath}`);

    if (!dryRun) {
      fs.writeFileSync(filePath + ".bak", original, "utf8");
      fs.writeFileSync(filePath, updated, "utf8");
      console.log("✔ aplicado + backup criado");
    } else {
      console.log("👀 dry-run (sem alteração)");
    }
  }
}

function run() {
  const dryRun = process.argv.includes("--dry-run");

  const files = getVueFiles(ROOT_DIR);

  console.log(`🔍 arquivos encontrados: ${files.length}`);
  console.log(dryRun ? "🧪 DRY-RUN ativo\n" : "⚡ aplicando mudanças\n");

  files.forEach((f) => processFile(f, dryRun));

  console.log("\n✅ finalizado");
}

run();