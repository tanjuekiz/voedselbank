import { AllergenType, HalalStatus } from '../types';

export interface ProductAIVerificationResult {
  source: 'gemini-3.8-flash' | 'local-safety-engine';
  hasActiveRecallAlert: boolean;
  recallAlertTitle?: string;
  recallSeverity?: 'kritiek' | 'waarschuwing' | 'geen';
  recallExplanation?: string;
  halalStatus: HalalStatus;
  halalCertifierSuggestion?: string;
  halalMotivation: string;
  detectedAllergens: AllergenType[];
  safetyAdvice: string;
}

// Known Dutch NVWA recall reference database for client-side offline fallback
const CLIENT_DUTCH_RECALLS = [
  {
    keywords: ['zalm', 'gerookte zalm', 'forel', 'gerookte vis'],
    batchKeywords: ['L-26', 'ZM-', 'RECALL'],
    alertTitle: 'NVWA Terugroepactie: Listeria monocytogenes in gerookte vis',
    reason: 'Vermoedelijke besmetting met Listeria monocytogenes bacterie. Ernstig risico voor kwetsbare groepen.',
    advice: 'Direct afkeuren en vernietigen. Absoluut niet toevoegen aan voedselpakketten.',
  },
  {
    keywords: ['kip', 'kipnuggets', 'kipfilet', 'pluimvee'],
    batchKeywords: ['SALM-', 'KP-09'],
    alertTitle: 'NVWA Veiligheidswaarschuwing: Salmonella enterica',
    reason: 'Salmonella besmetting aangetroffen in partij rauwe kipfilet.',
    advice: 'In quarantaine plaatsen en barcode / batch controleren.',
  },
  {
    keywords: ['chocolade', 'hazelnoot', 'koekjes'],
    batchKeywords: ['CH-99', 'MET-'],
    alertTitle: 'Terugroepactie: Mogelijke metaaldeeltjes of niet-vermeld allergeen',
    reason: 'Productiefout verpakking: niet-gedeclareerde noten of metaalsplinters.',
    advice: 'Niet uitdelen aan huishoudens met notenallergie.',
  },
  {
    keywords: ['babymelk', 'zuigelingenvoeding', 'opvolgmelk'],
    batchKeywords: ['RECALL', 'TOX-'],
    alertTitle: 'NVWA Kwaliteitswaarschuwing Zuigelingenvoeding',
    reason: 'Afwijkende mineralenbalans geconstateerd bij laboratoriumcontrole.',
    advice: 'Strikt blokkeren voor uitgifte.',
  },
];

/**
 * Verify product with server-side Gemini 3.8 Flash or instant local safety rules
 */
export async function verifyProductWithAI(params: {
  productName: string;
  category?: string;
  batchNumber?: string;
  ingredients?: string;
}): Promise<ProductAIVerificationResult> {
  const { productName, category, batchNumber, ingredients } = params;

  try {
    const res = await fetch('/api/ai/verify-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName, category, batchNumber, ingredients }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        source: data.source || 'gemini-3.8-flash',
        hasActiveRecallAlert: Boolean(data.hasActiveRecallAlert),
        recallAlertTitle: data.recallAlertTitle || undefined,
        recallSeverity: data.recallSeverity || 'geen',
        recallExplanation: data.recallExplanation || '',
        halalStatus: (data.halalStatus as HalalStatus) || 'natuurlijk_halal',
        halalCertifierSuggestion: data.halalCertifierSuggestion || undefined,
        halalMotivation: data.halalMotivation || 'Automatisch beoordeeld op halal-conformiteit en allergenen.',
        detectedAllergens: (data.detectedAllergens || []) as AllergenType[],
        safetyAdvice: data.safetyAdvice || 'Standaard FIFO opslag hanteren.',
      };
    }
  } catch (err) {
    console.info('Client: backend AI request timed out or in offline mode, applying local safety rules engine', err);
  }

  // Pure Offline Fallback Engine (runs directly in browser when completely disconnected)
  const queryLower = `${productName} ${ingredients || ''}`.toLowerCase();
  const matchedRecall = CLIENT_DUTCH_RECALLS.find(
    (rec) =>
      rec.keywords.some((k) => queryLower.includes(k)) &&
      (rec.batchKeywords.some((b) => (batchNumber || '').toUpperCase().includes(b)) ||
        queryLower.includes('recall') ||
        queryLower.includes('terugroep'))
  );

  const isPork = /varken|spek|ham|pork|bacon|gelatine|reuzel/i.test(queryLower);
  const isAlcohol = /alcohol|wijn|bier|liqueur|rum|brandy/i.test(queryLower);
  const isMeatOrPoultry = /kip|rund|vlees|kalkoen|poultry|beef|lamb|lam|gehakt|worst/i.test(queryLower);
  const isPlantOrVegetarian = /brood|haver|rijst|appel|peer|banaan|groente|peul|boon|linzen|olie|fruit|pasta|groenten|aardappel/i.test(
    queryLower
  );
  const hasHalalKeyword = /halal/i.test(queryLower);

  let halalStatus: HalalStatus = 'natuurlijk_halal';
  let halalMotivation = 'Product bestaat uit natuurlijke plantaardige basisvoeding zonder dierlijke toevoegingen.';
  let halalCertifierSuggestion: string | undefined = undefined;

  if (isPork || isAlcohol) {
    halalStatus = 'niet_halal';
    halalMotivation = 'Niet halal: product bevat varkensvlees, gelatine of alcoholingrediënten.';
  } else if (hasHalalKeyword || (isMeatOrPoultry && queryLower.includes('halal'))) {
    halalStatus = 'halal_gecertificeerd';
    halalMotivation = 'Gecertificeerd Halal: vlees- of pluimveeproduct met officiële halal-certificering.';
    halalCertifierSuggestion = 'Halal Correct Certification Europe';
  } else if (isMeatOrPoultry) {
    halalStatus = 'niet_halal';
    halalMotivation = 'Vlees/pluimvee zonder expliciet halal-keurmerk geldt ter bescherming van cliënten als niet-halal.';
  } else if (isPlantOrVegetarian) {
    halalStatus = 'natuurlijk_halal';
    halalMotivation = 'Natuurlijk Halal: 100% plantaardig en vegetarisch product, geschikt voor halal-pakketten.';
  }

  const detectedAllergens: AllergenType[] = [];
  if (/brood|tarwe|havermout|gluten|meel|pasta|rogge|gerst/i.test(queryLower)) detectedAllergens.push('gluten');
  if (/melk|kaas|yoghurt|boter|zuivel|lactose|room/i.test(queryLower)) detectedAllergens.push('lactose');
  if (/pinda|aardnoot/i.test(queryLower)) detectedAllergens.push('pinda');
  if (/noten|amandelen|hazelnoot|walnoot|cashew|pecan/i.test(queryLower)) detectedAllergens.push('noten');
  if (/ei|eieren/i.test(queryLower)) detectedAllergens.push('ei');
  if (/soja|tofu|edamame/i.test(queryLower)) detectedAllergens.push('soja');
  if (/vis|zalm|tonijn|kabeljauw|makreel/i.test(queryLower)) detectedAllergens.push('vis');
  if (/garnaal|krab|kreeft|schaaldieren/i.test(queryLower)) detectedAllergens.push('schaaldieren');
  if (/selderij/i.test(queryLower)) detectedAllergens.push('selderij');
  if (/sesam/i.test(queryLower)) detectedAllergens.push('sesam');

  return {
    source: 'local-safety-engine',
    hasActiveRecallAlert: Boolean(matchedRecall),
    recallAlertTitle: matchedRecall?.alertTitle,
    recallSeverity: matchedRecall ? 'kritiek' : 'geen',
    recallExplanation: matchedRecall?.reason || 'Geen actieve terugroepacties gemeld voor dit product.',
    halalStatus,
    halalCertifierSuggestion,
    halalMotivation,
    detectedAllergens,
    safetyAdvice: matchedRecall
      ? matchedRecall.advice
      : halalStatus !== 'niet_halal'
      ? 'Geschikt voor Halal-voedselpakketten. Bewaren volgens FIFO richtlijnen.'
      : 'Standaard opslag. Gescheiden houden van halal goederen.',
  };
}
