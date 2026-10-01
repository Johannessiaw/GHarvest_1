import { LexiconEntry } from '../types';

// Core Ghanaian Towns & Farming Hubs across 16 Regions
export const GHANAIAN_TOWNS: Array<{ name: string; region: string; phonetics: string; commonErrors: string[] }> = [
  { name: 'Techiman', region: 'Bono East', phonetics: 'Teh-chee-man', commonErrors: ['tech man', 'take man', 'teach man', 'touch man'] },
  { name: 'Kumasi', region: 'Ashanti', phonetics: 'Koo-mah-see', commonErrors: ['commasy', 'coomasi', 'cumasi', 'komasi', 'comasi'] },
  { name: 'Sunyani', region: 'Bono', phonetics: 'Soon-yah-nee', commonErrors: ['sun yanny', 'sunny ani', 'son yani', 'sun yani'] },
  { name: 'Tamale', region: 'Northern', phonetics: 'Tah-mah-lay', commonErrors: ['tamaleh', 'tamali', 'to mally', 'termale'] },
  { name: 'Ejura', region: 'Ashanti', phonetics: 'Eh-joo-rah', commonErrors: ['ejuraa', 'e jura', 'edjura', 'ejurah'] },
  { name: 'Accra', region: 'Greater Accra', phonetics: 'Uh-krah', commonErrors: ['akra', 'accrah', 'a cra', 'acra'] },
  { name: 'Koforidua', region: 'Eastern', phonetics: 'Koh-foh-ree-dwah', commonErrors: ['kofi ridua', 'kofforidua', 'kofridia', 'kof ridua'] },
  { name: 'Cape Coast', region: 'Central', phonetics: 'Kayp Kohst', commonErrors: ['cape cost', 'cap coast', 'cape coz'] },
  { name: 'Takoradi', region: 'Western', phonetics: 'Tah-koh-rah-dee', commonErrors: ['taco radi', 'takorady', 'tarcoradi'] },
  { name: 'Ho', region: 'Volta', phonetics: 'Hoh', commonErrors: ['hoe', 'who', 'hoh'] },
  { name: 'Wa', region: 'Upper West', phonetics: 'Wah', commonErrors: ['wah', 'war', 'waa'] },
  { name: 'Bolgatanga', region: 'Upper East', phonetics: 'Bohl-gah-tan-gah', commonErrors: ['bolga tanga', 'bolga', 'bogatanga', 'bolga tonga'] },
  { name: 'Atebubu', region: 'Bono East', phonetics: 'Ah-teh-boo-boo', commonErrors: ['ate bubu', 'attebubu', 'arti bubu'] },
  { name: 'Kintampo', region: 'Bono East', phonetics: 'Kin-tam-poh', commonErrors: ['keen tampo', 'kintam po', 'kin tempo'] },
  { name: 'Nkoranza', region: 'Bono East', phonetics: 'En-koh-ran-zah', commonErrors: ['n koranza', 'enkoranza', 'koranza'] },
  { name: 'Wenchi', region: 'Bono', phonetics: 'Wen-chee', commonErrors: ['when chi', 'wentshi', 'wintshi'] },
  { name: 'Dormaa Ahenkro', region: 'Bono', phonetics: 'Dohr-mah Ah-heng-kroh', commonErrors: ['dormaa', 'dorma', 'dohrma', 'dorma henkro'] },
  { name: 'Berekum', region: 'Bono', phonetics: 'Beh-reh-koom', commonErrors: ['berry come', 'berekoom', 'bere cum'] },
  { name: 'Somanya', region: 'Eastern', phonetics: 'Soh-man-yah', commonErrors: ['so manya', 'sormanya', 'sumanya'] },
  { name: 'Asamankese', region: 'Eastern', phonetics: 'Ah-sah-mang-kay-seh', commonErrors: ['asa mankese', 'asamankesie', 'asamang'] },
  { name: 'Nkawkaw', region: 'Eastern', phonetics: 'En-kow-kow', commonErrors: ['en kow kow', 'nkowkow', 'nokaw'] },
  { name: 'Mankessim', region: 'Central', phonetics: 'Man-kay-seem', commonErrors: ['man kissim', 'man kesim', 'mankissim'] },
  { name: 'Assin Foso', region: 'Central', phonetics: 'Ah-seen Foh-soh', commonErrors: ['assin fosu', 'aseen foso', 'hasin foso'] },
  { name: 'Twifo Praso', region: 'Central', phonetics: 'Twee-foh Prah-soh', commonErrors: ['twifo praso', 'tuifo praso'] },
  { name: 'Elmina', region: 'Central', phonetics: 'El-mee-nah', commonErrors: ['el mina', 'elmeena'] },
  { name: 'Tarkwa', region: 'Western', phonetics: 'Tar-kwah', commonErrors: ['tarquah', 'tar kwa'] },
  { name: 'Sefwi Wiawso', region: 'Western North', phonetics: 'Sef-wee Wee-ow-soh', commonErrors: ['sefwi', 'sehfwi', 'wiawso'] },
  { name: 'Bibiani', region: 'Western North', phonetics: 'Bee-bee-ah-nee', commonErrors: ['bibianee', 'bee bee ah nee'] },
  { name: 'Enchi', region: 'Western North', phonetics: 'En-chee', commonErrors: ['n chi', 'entchi'] },
  { name: 'Goaso', region: 'Ahafo', phonetics: 'Gwah-soh', commonErrors: ['goh ah soh', 'gwaso'] },
  { name: 'Bechem', region: 'Ahafo', phonetics: 'Beh-chem', commonErrors: ['beh chim', 'bechum'] },
  { name: 'Duayaw Nkwanta', region: 'Ahafo', phonetics: 'Dwah-yow En-kwan-tah', commonErrors: ['duayaw', 'nkwanta', 'dwayow'] },
  { name: 'Kpando', region: 'Volta', phonetics: 'Kpan-doh', commonErrors: ['kpandoo', 'pan doh'] },
  { name: 'Hohoe', region: 'Volta', phonetics: 'Hoh-hway', commonErrors: ['ho hway', 'hoehwe', 'ho ho e'] },
  { name: 'Sogakope', region: 'Volta', phonetics: 'Soh-gah-koh-pay', commonErrors: ['soga kope', 'soga cope'] },
  { name: 'Aflao', region: 'Volta', phonetics: 'Ah-flah-oh', commonErrors: ['aflaw', 'aflow'] },
  { name: 'Denu', region: 'Volta', phonetics: 'Deh-noo', commonErrors: ['de new', 'day noo'] },
  { name: 'Yendi', region: 'Northern', phonetics: 'Yen-dee', commonErrors: ['yen di', 'yendy'] },
  { name: 'Bimbilla', region: 'Northern', phonetics: 'Beem-beel-lah', commonErrors: ['bim bila', 'beembilla'] },
  { name: 'Walewale', region: 'North East', phonetics: 'Wah-lay-wah-lay', commonErrors: ['wale wale', 'waly waly'] },
  { name: 'Nalerigu', region: 'North East', phonetics: 'Nah-leh-ree-goo', commonErrors: ['nalerigo', 'nahleh reegoo'] },
  { name: 'Damongo', region: 'Savannah', phonetics: 'Dah-mon-goh', commonErrors: ['da mongo', 'damango'] },
  { name: 'Salaga', region: 'Savannah', phonetics: 'Sah-lah-gah', commonErrors: ['salgah', 'sa laga'] },
  { name: 'Bawku', region: 'Upper East', phonetics: 'Bow-koo', commonErrors: ['bauku', 'bow koo'] },
  { name: 'Navrongo', region: 'Upper East', phonetics: 'Nahv-ron-goh', commonErrors: ['nav rongo', 'navrrongo'] },
  { name: 'Tumu', region: 'Upper West', phonetics: 'Too-moo', commonErrors: ['two moo', 'toomoo'] },
  { name: 'Tema', region: 'Greater Accra', phonetics: 'Tay-mah', commonErrors: ['tay ma', 'te ma'] },
  { name: 'Madina', region: 'Greater Accra', phonetics: 'Mah-dee-nah', commonErrors: ['medina', 'madeena'] },
  { name: 'Kasoa', region: 'Central', phonetics: 'Kah-swah', commonErrors: ['casua', 'kah swa', 'casoa'] },
  { name: 'Ashaiman', region: 'Greater Accra', phonetics: 'Ah-shy-man', commonErrors: ['ashiman', 'a shai man'] },
  { name: 'Agbogbloshie', region: 'Greater Accra', phonetics: 'Ah-gbog-bloh-shee', commonErrors: ['agbobloshie', 'agbogblo shi'] },
  { name: 'Kejetia', region: 'Ashanti', phonetics: 'Keh-jeh-tee-ah', commonErrors: ['kejeta', 'ke jatia', 'kajetia'] },
];

// Ghanaian Crops & Harvests with local names (Twi/Akan, Ga, Ewe)
export const GHANAIAN_CROPS = [
  { name: 'Maize', localName: 'Aburo', twi: 'Aburoɔ', category: 'Cereals', units: ['Max Bag (100kg)', 'Mini Bag (50kg)', 'Olonka'], phonetics: 'Ah-boo-roh' },
  { name: 'Tomatoes', localName: 'Nntosi', twi: 'Nntosio / Tomato', category: 'Vegetables', units: ['Crate (large)', 'Crate (medium)', 'Box'], phonetics: 'En-toh-see' },
  { name: 'Cassava', localName: 'Bankye', twi: 'Bankye', category: 'Roots & Tubers', units: ['Max Bag (100kg)', 'Load (Pickup)', 'Tonne'], phonetics: 'Bahn-chay' },
  { name: 'Yam', localName: 'Bayere', twi: 'Bayerɛ (Pona / Dente)', category: 'Roots & Tubers', units: ['100 Tubers', '50 Tubers', 'Single Tuber'], phonetics: 'Bah-yeh-ray' },
  { name: 'Plantain', localName: 'Borode', twi: 'Borɔdeɛ (Apem / Apantu)', category: 'Roots & Tubers', units: ['Bunch (Large)', 'Bunch (Medium)', 'Load'], phonetics: 'Baw-raw-deh' },
  { name: 'Cocoyam', localName: 'Mankani', twi: 'Mankani', category: 'Roots & Tubers', units: ['Bag (70kg)', 'Sack'], phonetics: 'Mahn-kah-nee' },
  { name: 'Pepper', localName: 'Mako', twi: 'Mako (Kpakpo Shito / Legon 18)', category: 'Vegetables', units: ['Bag (50kg)', 'Basket', 'Olonka'], phonetics: 'Mah-koh' },
  { name: 'Onions', localName: 'Gyeene', twi: 'Gyeene (Bawku Red / White)', category: 'Vegetables', units: ['Net Bag (80kg)', 'Max Bag', 'Olonka'], phonetics: 'Jee-nay' },
  { name: 'Okra', localName: 'Nkruma', twi: 'Nkruma', category: 'Vegetables', units: ['Basket', 'Bag', 'Olonka'], phonetics: 'En-kroo-mah' },
  { name: 'Garden Eggs', localName: 'Nsusuwa', twi: 'Nsusuwa / Nyaadewa', category: 'Vegetables', units: ['Bag (60kg)', 'Basket'], phonetics: 'En-soo-soo-wah' },
  { name: 'Cabbage', localName: 'Cabbage', twi: 'Kyebeji', category: 'Vegetables', units: ['Max Bag (80kg)', 'Load'], phonetics: 'Kyeh-beh-jee' },
  { name: 'Carrots', localName: 'Carrots', twi: 'Karoti', category: 'Vegetables', units: ['Max Bag (70kg)', 'Basket'], phonetics: 'Kah-roh-tee' },
  { name: 'Pineapple', localName: 'Aborobe', twi: 'Aborɔbɛ (Sugarloaf / MD2)', category: 'Fruits', units: ['100 Pieces', 'Crate', 'Tonne'], phonetics: 'Ah-baw-raw-beh' },
  { name: 'Mango', localName: 'Mango', twi: 'Amango (Keitt / Kent)', category: 'Fruits', units: ['Crate (25kg)', '100 Pieces'], phonetics: 'Ah-man-goh' },
  { name: 'Watermelon', localName: 'Watermelon', twi: 'Anwea Borɔbɛ', category: 'Fruits', units: ['100 Pieces', 'Truckload'], phonetics: 'Ahn-way-ah' },
  { name: 'Cocoa', localName: 'Kooko', twi: 'Kookoo (Grade 1)', category: 'Cash Crops', units: ['Bag (64kg Cocobod Standard)', 'Tonne'], phonetics: 'Koo-koo' },
  { name: 'Groundnuts', localName: 'Nkatie', twi: 'Nkatenkwan / Nkatie', category: 'Legumes', units: ['Max Bag (100kg)', 'Olonka'], phonetics: 'En-kah-tee-ay' },
  { name: 'Soybeans', localName: 'Asee', twi: 'Aseɛ / Soyabean', category: 'Legumes', units: ['Max Bag (100kg)', 'Mini Bag'], phonetics: 'Ah-see-ay' },
  { name: 'Rice', localName: 'Emo', twi: 'Ɛmo (Perfume / Aveyime)', category: 'Cereals', units: ['Bag (50kg)', 'Bag (25kg)', 'Olonka'], phonetics: 'Eh-moh' },
];

// Ghanaian Agricultural Units
export const GHANAIAN_UNITS = [
  { name: 'Olonka', description: 'Standard Ghanaian volume tin (~2.5kg for grains)', category: 'Volume' },
  { name: 'Max Bag (100kg)', description: 'Full jute sack standard in Techiman and Kejetia markets', category: 'Weight' },
  { name: 'Mini Bag (50kg)', description: 'Half jute/poly woven sack', category: 'Weight' },
  { name: 'Crate', description: 'Standard wooden/plastic crate for tomatoes and mangoes (~40-50kg)', category: 'Container' },
  { name: 'Basket', description: 'Woven cane basket used for peppers, garden eggs and okra', category: 'Container' },
  { name: '100 Tubers', description: 'Standard wholesale count for yam in Techiman and Ejura', category: 'Count' },
  { name: 'Net Bag (80kg)', description: 'Breathable mesh bag for onions and cabbage', category: 'Container' },
  { name: 'Tonne', description: 'Metric Tonne (1,000kg) for institutional/export buyers', category: 'Metric' },
  { name: 'Bunch', description: 'Whole plantain stalk with hands', category: 'Harvest' },
  { name: 'Load', description: 'Full bed of Kia truck or pickup vehicle', category: 'Bulk' },
];

// Speech Recognition Normalization Rules (Raw ASR errors -> True Ghanaian intent)
export const ASR_CORRECTIONS_DICT: Record<string, string> = {
  // Town names
  'tech man': 'Techiman',
  'take man': 'Techiman',
  'teach man': 'Techiman',
  'commasy': 'Kumasi',
  'coomasi': 'Kumasi',
  'cumasi': 'Kumasi',
  'komasi': 'Kumasi',
  'sun yanny': 'Sunyani',
  'sunny ani': 'Sunyani',
  'son yani': 'Sunyani',
  'tamaleh': 'Tamale',
  'tamali': 'Tamale',
  'e jura': 'Ejura',
  'edjura': 'Ejura',
  'kofforidua': 'Koforidua',
  'kofridia': 'Koforidua',
  'kofi ridua': 'Koforidua',
  'cape cost': 'Cape Coast',
  'cap coast': 'Cape Coast',
  'taco radi': 'Takoradi',
  'bolga': 'Bolgatanga',
  'bolga tanga': 'Bolgatanga',
  'ate bubu': 'Atebubu',
  'kin tampo': 'Kintampo',
  'dorma': 'Dormaa',
  'so manya': 'Somanya',
  'soga kope': 'Sogakope',
  'casua': 'Kasoa',
  'ashiman': 'Ashaiman',
  'agbobloshie': 'Agbogbloshie',
  'kejeta': 'Kejetia',
  'kajetia': 'Kejetia',

  // Crops
  'mays': 'maize',
  'maze': 'maize',
  'aburo': 'maize',
  'aburoo': 'maize',
  'cassi ava': 'cassava',
  'cassa va': 'cassava',
  'bankye': 'cassava',
  'bayere': 'yam',
  'bayeri': 'yam',
  'bayere dente': 'yam (Dente)',
  'pona': 'yam (Pona)',
  'borode': 'plantain',
  'borodee': 'plantain',
  'mankani': 'cocoyam',
  'mako': 'pepper',
  'shito': 'pepper',
  'gyeene': 'onions',
  'geene': 'onions',
  'nkruma': 'okra',
  'okro': 'okra',
  'nsusuwa': 'garden eggs',
  'aborobe': 'pineapple',
  'kooko': 'cocoa',
  'kookoo': 'cocoa',
  'nkatie': 'groundnuts',
  'asee': 'soybeans',
  'emo': 'rice',

  // Numbers in Twi
  'baako': '1',
  'mienu': '2',
  'mmienu': '2',
  'miensa': '3',
  'mmiensa': '3',
  'enan': '4',
  'enum': '5',
  'nsia': '6',
  'nson': '7',
  'nwɔtwe': '8',
  'nkron': '9',
  'edu': '10',
  'aduonu': '20',
  'aduasa': '30',
  'aduanan': '40',
  'adaduonum': '50',
  'aduonum': '50',
  'aduosia': '60',
  'aduoson': '70',
  'aduowɔtwe': '80',
  'aduokron': '90',
  'ɔha': '100',
  'oha': '100',
  'aha mienu': '200',
  'apem': '1,000',
  'apem mienu': '2,000',
  'apem num': '5,000',

  // Numbers in Ga (Greater Accra)
  'ekome': '1',
  'enyo': '2',
  'enyɔ': '2',
  'ete': '3',
  'etɛ': '3',
  'ejwe': '4',
  'enumo': '5',
  'enumɔ': '5',
  'ekpaa': '6',
  'kpawo': '7',
  'kpaanyo': '8',
  'kpaanyɔ': '8',
  'neehu': '9',
  'nyongma': '10',
  'nyɔŋma': '10',
  'nyongmai enyo': '20',
  'nyɔŋmai enyɔ': '20',
  'nyongmai ete': '30',
  'nyɔŋmai etɛ': '30',
  'nyongmai enumo': '50',
  'nyɔŋmai enumɔ': '50',
  'ohai': '100',

  // Numbers in Ewe (Volta Region)
  'deka': '1',
  'ɖeka': '1',
  'eve': '2',
  'eton': '3',
  'etɔ̃': '3',
  'ene': '4',
  'aton': '5',
  'atɔ̃': '5',
  'ade': '6',
  'adé': '6',
  'adre': '7',
  'enyi': '8',
  'asieke': '9',
  'blawa': '10',
  'blaatɔ̃': '50',
  'blaaton': '50',
  'alafa': '100',

  // Ga Language Vocabulary
  'ojekoo': 'good day (Ga)',
  'te oyoo tenng': 'how are you (Ga)',
  'mi nge kpakpa': 'I am fine (Ga)',
  'oye wala donng': 'thank you (Ga)',
  'mi taoo': 'I want (Ga)',
  'amen': 'tomatoes (Ga)',
  'amɛ̃': 'tomatoes (Ga)',
  'able': 'maize (Ga)',
  'ablẽ': 'maize (Ga)',
  'yele': 'yam (Ga)',
  'duade': 'cassava (Ga)',
  'amadaa': 'plantain (Ga)',
  'kpakpo shito': 'pepper (Ga)',

  // Ewe Language Vocabulary
  'ndi na mi': 'good morning (Ewe)',
  'ngdo na mi': 'good afternoon (Ewe)',
  'ŋdɔ na mi': 'good afternoon (Ewe)',
  'fie na mi': 'good evening (Ewe)',
  'foe nyuie': 'how are you (Ewe)',
  'foɛ nyuie': 'how are you (Ewe)',
  'akpe na wo': 'thank you (Ewe)',
  'me di be': 'I want (Ewe)',
  'teli': 'tomatoes (Ewe)',
  'bli': 'maize (Ewe)',
  'agbleli': 'cassava (Ewe)',
  'agbadu': 'plantain (Ewe)',
  'agbaɖu': 'plantain (Ewe)',
  'atadi': 'pepper (Ewe)',

  // Currency
  'cedis': 'GHS',
  'cedi': 'GHS',
  'ghana cedi': 'GHS',
  'ghana cedis': 'GHS',
  'ghc': 'GHS',
  'pesewas': 'pesewas',

  // Ghanaian slang & conversational code-switching
  'chale': 'chale (friend)',
  'charley': 'chale',
  'make i': 'let me',
  'i dey': 'I am',
  'i dey need': 'I need',
  'i want buy': 'I want to buy',
  'how much be': 'how much is',
  'abi': 'right?',
  'bossu': 'boss',
  'where you dey': 'where are you',
  'me pe': 'I want',
  'me pe se': 'I want to',
  'seisei': 'now / currently',
  'akye': 'good morning',
  'wo ho te sen': 'how are you',
  'meye': 'I am fine',
  'medaase': 'thank you',
  'edaase': 'thank you',
  'nipa baako': 'one person',
};

// GhanaNLP Lexicon generator for 10,000+ linguistic training dataset
export function generateGhanaNlpDataset(): LexiconEntry[] {
  const entries: LexiconEntry[] = [];
  let idCounter = 1;

  // 1. Towns & Regions
  GHANAIAN_TOWNS.forEach((t) => {
    entries.push({
      id: `town-${idCounter++}`,
      term: t.name,
      category: 'town',
      englishMeaning: `Major agricultural trading hub/town in ${t.region} region of Ghana`,
      phoneticSpelling: t.phonetics,
      commonMistakes: t.commonErrors,
      regionOrContext: t.region,
    });
  });

  // 2. Crops & Commodities
  GHANAIAN_CROPS.forEach((c) => {
    entries.push({
      id: `crop-${idCounter++}`,
      term: c.name,
      category: 'crop',
      englishMeaning: `${c.name} (${c.category}) - local name ${c.localName}`,
      twiEquivalent: c.twi,
      phoneticSpelling: c.phonetics,
      commonMistakes: [c.localName.toLowerCase(), c.twi.toLowerCase(), `${c.name.toLowerCase()} harvest`],
      regionOrContext: c.category,
    });
  });

  // 3. Units
  GHANAIAN_UNITS.forEach((u) => {
    entries.push({
      id: `unit-${idCounter++}`,
      term: u.name,
      category: 'unit',
      englishMeaning: u.description,
      phoneticSpelling: u.name,
      commonMistakes: [u.name.toLowerCase()],
      regionOrContext: u.category,
    });
  });

  // 4. ASR Corrections & Slang
  Object.entries(ASR_CORRECTIONS_DICT).forEach(([err, corr]) => {
    entries.push({
      id: `asr-${idCounter++}`,
      term: err,
      category: 'asr_correction',
      englishMeaning: `Normalized to: ${corr}`,
      phoneticSpelling: corr,
      commonMistakes: [err],
      regionOrContext: 'Ghana Speech Normalization',
    });
  });

  // 5. Synthesize 10,000+ domain training variations for Ghanaian agricultural commerce
  // Combining crops, towns, units, quantities, and Ghanaian conversational phrases
  // This simulates the massive GhanaNLP parallel and acoustic alignment datasets
  const actionVerbs = [
    { en: 'I want to buy', twi: 'Me pɛ sɛ me tɔ', slang: 'I dey need to buy' },
    { en: 'I want to sell', twi: 'Me pɛ sɛ me tɔn', slang: 'I want sell' },
    { en: 'Can you deliver to', twi: 'Wubetumi de akɔ', slang: 'You fit carry go' },
    { en: 'How much is a bag of', twi: 'Sɛn na bag baako yɛ wɔ', slang: 'How much be bag of' },
    { en: 'Send it straight to', twi: 'Fa kɔ tẽẽ kɔsi', slang: 'Carry am reach' },
    { en: 'Check market price for', twi: 'Hwɛ gua boɔ ma', slang: 'Check the cedi price for' },
    { en: 'Find verified farmers in', twi: 'Hwehwɛ akuafoɔ pa wɔ', slang: 'Get me solid farmers for' },
    { en: 'Arrange transport from', twi: 'Hyehyɛ lori firi', slang: 'Organize Benz truck from' },
    { en: 'Confirm order for', twi: 'Si order no so ma', slang: 'Lock the order for' },
    { en: 'Deposit escrow payment for', twi: 'Fa sika no to nkyɛn ma', slang: 'Pay escrow via MoMo for' },
  ];

  const quantities = [10, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 300, 500, 1000];

  for (let i = 0; i < actionVerbs.length && entries.length < 10100; i++) {
    const verb = actionVerbs[i];
    for (let c = 0; c < GHANAIAN_CROPS.length && entries.length < 10100; c++) {
      const crop = GHANAIAN_CROPS[c];
      for (let t = 0; t < GHANAIAN_TOWNS.length && entries.length < 10100; t++) {
        const town = GHANAIAN_TOWNS[t];
        const qty = quantities[(i + c + t) % quantities.length];
        const unit = crop.units[0];

        entries.push({
          id: `nlp-dataset-${idCounter++}`,
          term: `${verb.en} ${qty} ${unit} of ${crop.name} in ${town.name}`,
          category: 'twi_phrase',
          englishMeaning: `${verb.en} ${qty} ${unit} of ${crop.name} in ${town.name} (${town.region})`,
          twiEquivalent: `${verb.twi} ${crop.twi} ${qty} ${unit} wɔ ${town.name}`,
          phoneticSpelling: `${verb.slang} ${qty} ${unit} ${crop.phonetics} ${town.phonetics}`,
          commonMistakes: [
            `${verb.slang.toLowerCase()} ${qty} ${crop.localName.toLowerCase()} ${town.commonErrors[0] || town.name.toLowerCase()}`,
            `${crop.name.toLowerCase()} ${town.name.toLowerCase()}`
          ],
          regionOrContext: `${town.region} Supply Chain`,
        });
      }
    }
  }

  return entries;
}

// Global cached dataset of 10,000+ items
export const GLOBAL_GHANANLP_DATASET: LexiconEntry[] = generateGhanaNlpDataset();
