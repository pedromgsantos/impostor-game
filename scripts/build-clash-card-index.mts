// scripts/build-clash-card-index.mts
import fs from "node:fs/promises";

type SpicyFile = {
  type: "single";
  items: string[];
};

// mesma função de slug usada no Assign.tsx
function slugifyCard(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const raw = await fs.readFile("public/data/spicy.json", "utf8");
  const spicy = JSON.parse(raw) as SpicyFile;

  if (spicy.type !== "single") {
    throw new Error("spicy.json tem de ser { type: 'single', items: [...] }");
  }

  const index = spicy.items.map((name) => {
    const slug = slugifyCard(name);
    return {
      name,
      slug,
      path: `/cards/${slug}.png`
    };
  });

  await fs.mkdir("public/data", { recursive: true });
  await fs.writeFile(
    "public/data/clash-cards-index.json",
    JSON.stringify(index, null, 2),
    "utf8"
  );

  console.log(`✅ Gerado public/data/clash-cards-index.json com ${index.length} cartas.`);
}

main().catch((err) => {
  console.error("Erro ao gerar index de cartas:", err);
  process.exit(1);
});
