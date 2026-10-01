import { GeminiService } from './services/geminiService';
import { AgriculturalService } from './services/agriculturalService';
import { LogisticsService } from './services/logisticsService';

async function runTests() {
  console.log('🧪 Starting Kofi Unified Engine Verification Tests...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail || ''}`);
    }
  }

  // 1. "Show me tomatoes."
  const t1 = await GeminiService.localKofiEngine('Show me tomatoes.', {}, 'en-GH');
  assert(
    t1.navigation?.screen === 'marketplace' && t1.navigation?.searchQuery === 'Tomatoes',
    '1. "Show me tomatoes" navigates to marketplace with Tomatoes search',
    JSON.stringify(t1)
  );

  // 2. "Find tomatoes around Techiman."
  const t2 = await GeminiService.localKofiEngine('Find tomatoes around Techiman.', {}, 'en-GH');
  assert(
    t2.navigation?.screen === 'marketplace' && t2.navigation?.filterLocation === 'Techiman',
    '2. "Find tomatoes around Techiman" filters marketplace for Techiman',
    JSON.stringify(t2)
  );

  // 3. "I want to sell my tomatoes."
  const t3 = await GeminiService.localKofiEngine('I want to sell my tomatoes.', {}, 'en-GH');
  assert(
    t3.navigation?.openModal === 'farmer_listing',
    '3. "I want to sell my tomatoes" opens farmer listing modal',
    JSON.stringify(t3)
  );

  // 4. "Show my orders."
  const t4 = await GeminiService.localKofiEngine('Show my orders.', {}, 'en-GH');
  assert(
    t4.navigation?.screen === 'orders',
    '4. "Show my orders" navigates to orders screen',
    JSON.stringify(t4)
  );

  // 5. "Where is my order?"
  const t5 = await GeminiService.localKofiEngine('Where is my order?', {}, 'en-GH');
  assert(
    t5.navigation?.screen === 'orders' && !!t5.navigation?.orderId,
    '5. "Where is my order?" opens order tracking with orderId',
    JSON.stringify(t5)
  );

  // 6. "How much am I supposed to pay?"
  const t6 = await GeminiService.localKofiEngine('How much am I supposed to pay?', {}, 'en-GH');
  assert(
    t6.reply.includes('GH₵') && t6.navigation?.screen === 'orders',
    '6. "How much am I supposed to pay?" returns order payment breakdown',
    JSON.stringify(t6)
  );

  // 7. "Find a truck for this order."
  const t7 = await GeminiService.localKofiEngine('Find a truck for this order.', {}, 'en-GH');
  assert(
    t7.navigation?.screen === 'logistics' && t7.actionCard?.type === 'logistics_estimate',
    '7. "Find a truck for this order" navigates to logistics with estimate card',
    JSON.stringify(t7)
  );

  // 8. "Take me home."
  const t8 = await GeminiService.localKofiEngine('Take me home.', {}, 'en-GH');
  assert(
    t8.navigation?.screen === 'home',
    '8. "Take me home" navigates to home overview',
    JSON.stringify(t8)
  );

  // 9. "Help me."
  const t9 = await GeminiService.localKofiEngine('Help me.', {}, 'en-GH');
  assert(
    t9.reply.toLowerCase().includes('kofi') && t9.reply.toLowerCase().includes('guide'),
    '9. "Help me" explains platform capabilities',
    JSON.stringify(t9)
  );

  // 10. "I don't understand this page."
  const t10 = await GeminiService.localKofiEngine("I don't understand this page.", {}, 'en-GH', [], { currentRoute: 'marketplace' });
  assert(
    t10.reply.toLowerCase().includes('marketplace') || t10.reply.toLowerCase().includes('harvest'),
    '10. "I don\'t understand this page" explains current marketplace route',
    JSON.stringify(t10)
  );

  // 11. "Who was Kwame Nkrumah?"
  const t11 = await GeminiService.localKofiEngine('Who was Kwame Nkrumah?', {}, 'en-GH');
  assert(
    t11.reply.includes('Prime Minister') || t11.reply.includes('independence'),
    '11. "Who was Kwame Nkrumah?" answers Ghanaian historical knowledge',
    JSON.stringify(t11)
  );

  // 12. "Calculate 25 * 48"
  const t12 = await GeminiService.localKofiEngine('Calculate 25 * 48', {}, 'en-GH');
  assert(
    t12.reply.includes('1,200') || t12.reply.includes('1200'),
    '12. "Calculate 25 * 48" returns 1,200',
    JSON.stringify(t12)
  );

  // 13. "What is inflation?"
  const t13 = await GeminiService.localKofiEngine('What is inflation?', {}, 'en-GH');
  assert(
    t13.reply.toLowerCase().includes('purchasing power') || t13.reply.toLowerCase().includes('prices of goods'),
    '13. "What is inflation?" explains economic concepts',
    JSON.stringify(t13)
  );

  // 14. "Current price of maize in Ejura"
  const t14 = await GeminiService.localKofiEngine('Current price of maize in Ejura', {}, 'en-GH');
  assert(
    t14.reply.includes('Ejura') && (t14.reply.includes('240') || t14.reply.includes('Maize')),
    '14. "Current price of maize in Ejura" returns Ejura benchmark rate',
    JSON.stringify(t14)
  );

  // 15. Multi-turn procurement flow:
  // Turn 1: "I need maize."
  const turn1 = await GeminiService.localKofiEngine('I need maize.', {}, 'en-GH');
  let mem = turn1.updatedMemory;
  assert(mem.product === 'Maize', '15a. Multi-turn Step 1: remembers Maize in memory');

  // Turn 2: "80 bags."
  const turn2 = await GeminiService.localKofiEngine('80 bags.', mem, 'en-GH');
  mem = turn2.updatedMemory;
  assert(mem.quantity === 80, '15b. Multi-turn Step 2: updates quantity to 80 bags');

  // Turn 3: "From Ejura to Kumasi."
  const turn3 = await GeminiService.localKofiEngine('From Ejura to Kumasi.', mem, 'en-GH');
  assert(
    turn3.actionCard?.type === 'logistics_estimate' &&
    turn3.reply.includes('Ejura') &&
    turn3.reply.includes('Kumasi'),
    '15c. Multi-turn Step 3: directional route calculation for 80 bags of Maize'
  );

  // 16. Escrow Payment Provider integration test
  const { EscrowService } = await import('./services/escrowService');
  const testOrder = await EscrowService.createOrder({
    crop: 'Tomatoes',
    quantity: 50,
    unit: 'Crates',
    pickupTown: 'Techiman',
    deliveryTown: 'Kumasi',
  });
  assert(
    testOrder.status === 'escrow_funded' && testOrder.escrowStatus === 'held' && testOrder.isDemo === true,
    '16. EscrowService runs through activePaymentProvider and sets verified status',
    JSON.stringify(testOrder)
  );

  // 17. SSRF and DNS Rebinding Guard
  const { UrlInspectorService } = await import('./services/urlInspectorService');
  const ssrf1 = await UrlInspectorService.inspectUrl('http://127.0.0.1:3000/api/health');
  const ssrf2 = await UrlInspectorService.inspectUrl('http://169.254.169.254/latest/meta-data/');
  assert(
    ssrf1.status === 403 && ssrf2.status === 403 && !ssrf1.isAccessible && !ssrf2.isAccessible,
    '17. UrlInspectorService blocks private/loopback/cloud-metadata addresses with 403 SSRF guard'
  );

  // 18. Unclear / unparsed request prompts user to repeat or paraphrase
  const unclear = await GeminiService.localKofiEngine('hmmm asdf xyz', {}, 'en-GH');
  assert(
    unclear.reply.toLowerCase().includes('repeat') || unclear.reply.toLowerCase().includes('paraphrase'),
    '18. Unclear/unparsed request asks user to repeat or paraphrase',
    JSON.stringify(unclear)
  );

  console.log(`\n🎉 Results: ${passed}/${total} verification tests passed!`);
  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
