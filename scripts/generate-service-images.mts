// Gera opções de imagem para o banner de cada serviço pelo Vercel AI Gateway.
//
// Uso: yarn images:services <pasta-de-saída> [slug ...]
// Precisa de AI_GATEWAY_API_KEY no .env.local (ou exportada no terminal).
// Cada imagem custa alguns centavos de dólar na conta Vercel do time.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { config } from "dotenv";
import { generateImage } from "ai";

config({ path: [".env.development.local", ".env.local"], quiet: true });

const MODEL = process.env.AI_GATEWAY_IMAGE_MODEL ?? "openai/gpt-image-2";
const OPTIONS_PER_SERVICE = 2;

// Estilo comum: combina com a paleta creme e dourada do site.
const STYLE =
  "Editorial lifestyle photograph, warm natural window light, soft cream, beige and champagne-gold color palette, " +
  "subtle golden accents, shallow depth of field, premium and calm mood, photorealistic, vertical composition. " +
  "No text, no letters, no logos, no watermarks. Faces, if any, turned away or out of focus.";

const PROMPTS: Record<string, string> = {
  "business-consulting":
    "A bright modern office meeting table in the United States: a business consultant's hands pointing at growth charts " +
    "on a tablet next to a leather notebook, a pen and a cup of coffee, a small business owner listening across the table.",
  "personal-advisory":
    "A cozy, elegant home dining table: a couple organizing their household finances with an advisor, a laptop with a " +
    "simple budget spreadsheet, neatly stacked documents in folders and a calculator, relaxed and reassuring atmosphere.",
  "life-insurance":
    "A parent walking hand in hand with a young child through a sunlit park at golden hour, seen from behind, " +
    "warm backlight and gentle lens flare, a feeling of protection, safety and love for the family.",
};

const outDir = process.argv[2];
const slugs = process.argv.slice(3).length
  ? process.argv.slice(3)
  : Object.keys(PROMPTS);

if (!outDir) {
  console.error("Informe a pasta de saída: yarn images:services <pasta>");
  process.exit(1);
}
if (!process.env.AI_GATEWAY_API_KEY) {
  console.error("Defina AI_GATEWAY_API_KEY no .env.local.");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });

for (const slug of slugs) {
  const prompt = PROMPTS[slug];
  if (!prompt) {
    console.error(`Serviço desconhecido: ${slug}`);
    continue;
  }
  console.log(
    `Gerando ${OPTIONS_PER_SERVICE} opções para ${slug} (${MODEL})...`,
  );
  const { images } = await generateImage({
    model: MODEL,
    prompt: `${prompt} ${STYLE}`,
    size: "1024x1536",
    n: OPTIONS_PER_SERVICE,
  });
  for (const [index, image] of images.entries()) {
    const file = path.join(outDir, `${slug}-${index + 1}.png`);
    await writeFile(file, image.uint8Array);
    console.log(`  salvo ${file}`);
  }
}
