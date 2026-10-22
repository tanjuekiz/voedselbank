import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Embedded Dutch NVWA food recalls reference database
const KNOWN_DUTCH_RECALLS = [
  {
    keywords: ['zalm', 'gerookte zalm', 'forel'],
    batchKeywords: ['L-26', 'ZM-'],
    alertTitle: 'NVWA Terugroepactie: Listeria monocytogenes in gerookte vis',
    reason: 'Vermoedelijke besmetting met Listeria monocytogenes bacterie. Ernstig gevaar voor zwangeren en ouderen.',
    advice: 'Direct afkeuren en vernietigen, niet uitdelen in pakketten.',
  },
  {
    keywords: ['kip', 'kipnuggets', 'kipfilet', 'pluimvee'],
    batchKeywords: ['SALM-', 'KP-09'],
    alertTitle: 'NVWA Veiligheidswaarschuwing: Salmonella enterica',
    reason: 'Salmonella besmetting aangetroffen in partij rauwe kipfiletblokjes.',
    advice: 'In quarantaine plaatsen en controleren op batchcode.',
  },
  {
    keywords: ['chocolade', 'hazelnoot', 'koekjes'],
    batchKeywords: ['CH-99', 'MET-'],
    alertTitle: 'Terugroepactie: Mogelijke metaaldeeltjes of niet-vermeld allergeen',
    reason: 'Productiefout bij verpakking: niet-gedeclareerde noten of metaaldeeltjes aangetroffen.',
    advice: 'Niet uitdelen aan gezinnen met notenallergie.',
  },
  {
    keywords: ['babymelk', 'zuigelingenvoeding', 'opvolgmelk'],
    batchKeywords: ['RECALL', 'TOX-'],
    alertTitle: 'NVWA Kwaliteitswaarschuwing Babyvoeding',
    reason: 'Afwijkende mineralenbalans geconstateerd bij laboratoriumcontrole fabriek.',
    advice: 'Strikt blokkeren voor uitgifte.',
  },
];

// Endpoint: AI Product & Recall Verification
app.post('/api/ai/verify-product', async (req, res) => {
  const { productName, category, batchNumber, ingredients } = req.body;

  if (!productName) {
    return res.status(400).json({ error: 'productName is verplicht' });
  }

  // Check known recall database first
  const queryLower = (productName + ' ' + (ingredients || '')).toLowerCase();
  const matchedRecall = KNOWN_DUTCH_RECALLS.find((rec) =>
    rec.keywords.some((k) => queryLower.includes(k)) &&
    (rec.batchKeywords.some((b) => (batchNumber || '').toUpperCase().includes(b)) || queryLower.includes('recall') || queryLower.includes('terugroep'))
  );

  // If Gemini API is available, call gemini-3.8-flash for deep analysis
  if (ai) {
    try {
      const prompt = `Je bent een officiële inspecteur voedselveiligheid en expert in halal-borging voor Voedselbank Nederland.
Analyseer het volgende product dat ingevoerd wordt in het magazijn:
- Productnaam: "${productName}"
- Categorie: "${category || 'Algemeen'}"
- Batchnummer: "${batchNumber || 'Onbekend'}"
- Ingrediënten/Toelichting: "${ingredients || 'Geen extra toelichting'}"

Voer de volgende 3 controles uit:
1. TERUGROEPACTIE CONTROLE (NVWA / EU RASFF):
   - Is dit type product of batch bekend bij recente terugroepacties (bijv. salmonella, listeria, vreemde voorwerpen, foutieve etikettering)?
2. HALAL CLASSIFICATIE:
   - halalStatus: "halal_gecertificeerd" (wanneer gecertificeerd halal zoals halal vlees, gevogelte met halal keurmerk), "natuurlijk_halal" (100% plantaardig, verse groenten, fruit, zuivere granen, peulvruchten, suiker, zout, water, plantaardige olie), of "niet_halal" (bevat varkensvlees, gelatine van varken, karmijnrood E120 indien niet halal, alcohol, wijnazijn).
   - halalMotivation: Korte toelichting in het Nederlands.
3. ALLERGENEN DETECTIE:
   - Welke van de volgende 10 allergenen zijn aanwezig: gluten, lactose, noten, pinda, ei, soja, vis, schaaldieren, selderij, sesam.
   - Geef een lijst van aanwezige allergenen.
4. SAMENVATTING & VEILIGHEIDSADVIES:
   - Korte instructie voor vrijwilligers bij uitgifte.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hasActiveRecallAlert: {
                type: Type.BOOLEAN,
                description: 'True als er een actieve terugroepactie of ernstig voedselveiligheidsrisico is voor dit product/batch.',
              },
              recallAlertTitle: {
                type: Type.STRING,
                description: 'Titel van de terugroepactie indien van toepassing, anders leeg.',
              },
              recallSeverity: {
                type: Type.STRING,
                description: 'kritiek, waarschuwing, of geen',
              },
              recallExplanation: {
                type: Type.STRING,
                description: 'Uitleg van het risico of waarom product veilig is.',
              },
              halalStatus: {
                type: Type.STRING,
                description: 'Moet exact zijn: "halal_gecertificeerd", "natuurlijk_halal", of "niet_halal".',
              },
              halalCertifierSuggestion: {
                type: Type.STRING,
                description: 'Aanbevolen instantie zoals Halal Correct of HQC indien van toepassing.',
              },
              halalMotivation: {
                type: Type.STRING,
                description: 'Heldere toelichting waarom dit product wel of niet halal is.',
              },
              detectedAllergens: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Gedetecteerde allergenen: gluten, lactose, noten, pinda, ei, soja, vis, schaaldieren, selderij, sesam.',
              },
              safetyAdvice: {
                type: Type.STRING,
                description: 'Advies voor vrijwilligers en opslag (bijv. gekoeld houden onder 4°C, apart van varkensvlees).',
              },
            },
            required: ['hasActiveRecallAlert', 'halalStatus', 'halalMotivation', 'detectedAllergens', 'safetyAdvice'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        source: 'gemini-3.8-flash',
        ...parsed,
        hasActiveRecallAlert: matchedRecall ? true : parsed.hasActiveRecallAlert,
        recallAlertTitle: matchedRecall ? matchedRecall.alertTitle : parsed.recallAlertTitle,
        recallExplanation: matchedRecall ? matchedRecall.reason : parsed.recallExplanation,
      });
    } catch (err: unknown) {
      console.warn('Gemini API call failed, falling back to local engine:', err);
    }
  }

  // Deterministic Local Fallback (100% offline & zero port restriction)
  const isPork = /varken|spek|ham|pork|bacon|gelatine/i.test(queryLower);
  const isAlcohol = /alcohol|wijn|bier|liqueur|rum|brandy/i.test(queryLower);
  const isMeatOrPoultry = /kip|rund|vlees|kalkoen|poultry|beef|lamb|lam/i.test(queryLower);
  const isPlantOrVegetarian = /brood|haver|rijst|appel|peer|banaan|groente|peul|boon|linzen|olie|fruit|pasta/i.test(queryLower);
  const hasHalalKeyword = /halal/i.test(queryLower);

  let halalStatus: 'halal_gecertificeerd' | 'natuurlijk_halal' | 'niet_halal' = 'natuurlijk_halal';
  let halalMotivation = 'Product bestaat uit natuurlijke plantaardige basisvoeding zonder dierlijke toevoegingen.';
  let halalCertifierSuggestion = '';

  if (isPork || isAlcohol) {
    halalStatus = 'niet_halal';
    halalMotivation = 'Niet halal: product bevat (bestanddelen van) varkensvlees, gelatine of alcohol.';
  } else if (hasHalalKeyword || (isMeatOrPoultry && queryLower.includes('halal'))) {
    halalStatus = 'halal_gecertificeerd';
    halalMotivation = 'Gecertificeerd Halal: vlees- of pluimveeproduct met officiële rituele slacht en borging.';
    halalCertifierSuggestion = 'Halal Correct Certification Europe';
  } else if (isMeatOrPoultry) {
    halalStatus = 'niet_halal';
    halalMotivation = 'Vlees/pluimvee zonder expliciet halal-keurmerk moet als niet-halal worden geclassificeerd ter bescherming van cliënten.';
  } else if (isPlantOrVegetarian) {
    halalStatus = 'natuurlijk_halal';
    halalMotivation = 'Natuurlijk Halal: 100% plantaardig voedsel, geschikt voor halal-voedselpakketten.';
  }

  // Detect allergens
  const detectedAllergens: string[] = [];
  if (/brood|tarwe|havermout|gluten|meel|pasta/i.test(queryLower)) detectedAllergens.push('gluten');
  if (/melk|kaas|yoghurt|boter|zuivel|lactose/i.test(queryLower)) detectedAllergens.push('lactose');
  if (/pinda|aardnoot/i.test(queryLower)) detectedAllergens.push('pinda');
  if (/noten|amandelen|hazelnoot|walnoot/i.test(queryLower)) detectedAllergens.push('noten');
  if (/ei|eieren/i.test(queryLower)) detectedAllergens.push('ei');
  if (/soja|tofu/i.test(queryLower)) detectedAllergens.push('soja');
  if (/vis|zalm|tonijn|kabeljauw/i.test(queryLower)) detectedAllergens.push('vis');
  if (/sesam/i.test(queryLower)) detectedAllergens.push('sesam');

  return res.json({
    source: 'local-safety-engine',
    hasActiveRecallAlert: Boolean(matchedRecall),
    recallAlertTitle: matchedRecall?.alertTitle || '',
    recallSeverity: matchedRecall ? 'kritiek' : 'geen',
    recallExplanation: matchedRecall?.reason || 'Geen actieve terugroepacties gemeld voor deze categorie.',
    halalStatus,
    halalCertifierSuggestion,
    halalMotivation,
    detectedAllergens,
    safetyAdvice: matchedRecall
      ? matchedRecall.advice
      : 'Standaard FIFO opslag. ' + (halalStatus === 'halal_gecertificeerd' ? 'Apart bewaren van niet-halal vleeswaren.' : ''),
  });
});

async function startServer() {
  // Mount Vite middleware in development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Voedselbank server actief op http://0.0.0.0:${PORT}`);
  });
}

startServer();
