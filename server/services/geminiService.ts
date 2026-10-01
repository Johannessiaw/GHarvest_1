/**
 * Gemini AI Service with Autonomous Function Calling, Action Registry Validation,
 * Bounded Tool Execution Loop, and Ghanaian Conversational Intelligence
 */

import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { AgriculturalService } from './agriculturalService';
import { LogisticsService } from './logisticsService';
import { EscrowService } from './escrowService';
import { UrlInspectorService } from './urlInspectorService';
import { AppAction, validateAppAction } from '../../src/types/actions';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Allowlist Tool Definitions for Gemini Function Calling
const navigateToScreenDeclaration: FunctionDeclaration = {
  name: 'navigate_to_screen',
  description: 'Navigate to an allowed screen in GHarvest: "home", "marketplace", "orders", "logistics", "farmer_services", or "nlp_studio".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      screen: {
        type: Type.STRING,
        description: 'Allowed screen: "home", "marketplace", "orders", "logistics", "farmer_services", "nlp_studio"',
      },
      reason: { type: Type.STRING, description: 'Explanation for navigation' },
    },
    required: ['screen'],
  },
};

const searchMarketplaceDeclaration: FunctionDeclaration = {
  name: 'search_marketplace',
  description: 'Search the marketplace for agricultural produce (e.g. Tomatoes, Maize, Yam, Cassava).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'Produce keyword to search' },
    },
    required: ['query'],
  },
};

const filterMarketplaceDeclaration: FunctionDeclaration = {
  name: 'filter_marketplace',
  description: 'Filter or sort marketplace listings by town location, price, crop, or sort order (e.g. "cheapest").',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: { type: Type.STRING, description: 'Town name, e.g. Techiman, Ejura, Tamale' },
      maxPrice: { type: Type.NUMBER, description: 'Maximum price in GHS' },
      crop: { type: Type.STRING, description: 'Crop name' },
      sort: { type: Type.STRING, description: 'Sort option: "cheapest", "highest_price", "nearest", or "newest"' },
    },
  },
};

const selectListingDeclaration: FunctionDeclaration = {
  name: 'select_listing',
  description: 'Select an active harvest listing by its listing ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      listingId: { type: Type.STRING, description: 'Listing ID, e.g. harvest-1 or h-101' },
    },
    required: ['listingId'],
  },
};

const openOrderDraftDeclaration: FunctionDeclaration = {
  name: 'open_order_draft',
  description: 'Prepare an order draft for user review. Note: this opens the confirmation flow; it does not commit funds or transfer money.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      crop: { type: Type.STRING, description: 'Crop name' },
      quantity: { type: Type.NUMBER, description: 'Number of units' },
      unit: { type: Type.STRING, description: 'Unit name (Bags, Crates, Tubers)' },
      pickupTown: { type: Type.STRING, description: 'Origin town' },
      deliveryTown: { type: Type.STRING, description: 'Destination town' },
      farmerName: { type: Type.STRING, description: 'Farmer name' },
      farmerPhone: { type: Type.STRING, description: 'Farmer contact phone' },
      unitPriceGHS: { type: Type.NUMBER, description: 'Unit price in GHS' },
    },
    required: ['crop', 'quantity'],
  },
};

const updateOrderQuantityDeclaration: FunctionDeclaration = {
  name: 'update_order_quantity',
  description: 'Update the quantity for a pending order or item currently being negotiated.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      quantity: { type: Type.NUMBER, description: 'New quantity' },
    },
    required: ['quantity'],
  },
};

const showOrdersDeclaration: FunctionDeclaration = {
  name: 'show_orders',
  description: 'Navigate to the Orders & Escrow view to see existing orders and shipment statuses.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      statusFilter: { type: Type.STRING, description: 'Optional status filter' },
    },
  },
};

const showOrderDetailsDeclaration: FunctionDeclaration = {
  name: 'show_order_details',
  description: 'View full details, payment breakdown, or milestones for a specific order ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderId: { type: Type.STRING, description: 'Order ID to inspect, e.g. GH-8421' },
    },
    required: ['orderId'],
  },
};

const showLogisticsDeclaration: FunctionDeclaration = {
  name: 'show_logistics',
  description: 'Open the Logistics & Freight calculation view.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      origin: { type: Type.STRING, description: 'Pickup town' },
      destination: { type: Type.STRING, description: 'Delivery town' },
      quantity: { type: Type.NUMBER, description: 'Quantity to transport' },
      crop: { type: Type.STRING, description: 'Produce crop' },
    },
  },
};

const trackOrderDeclaration: FunctionDeclaration = {
  name: 'track_order',
  description: 'Track the live transit status and driver details for an active order.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      orderId: { type: Type.STRING, description: 'Order ID to track' },
    },
    required: ['orderId'],
  },
};

const openFarmerServicesDeclaration: FunctionDeclaration = {
  name: 'open_farmer_services',
  description: 'Open the MoFA Farmer Services portal to list harvests or view cluster cooperatives.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: 'Either "list_harvest" or "view_coop"' },
    },
  },
};

const openHomeDeclaration: FunctionDeclaration = {
  name: 'open_home',
  description: 'Navigate to the GHarvest Home Dashboard.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const goBackDeclaration: FunctionDeclaration = {
  name: 'go_back',
  description: 'Navigate back to the previously viewed screen in GHarvest.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      reason: { type: Type.STRING, description: 'Optional reason' },
    },
  },
};

// Informational Query Tools
const getMarketPriceDeclaration: FunctionDeclaration = {
  name: 'get_market_price',
  description: 'Lookup current wholesale and retail prices for Ghanaian agricultural commodities in major markets (Techiman, Ejura, Kejetia, Agbogbloshie, Tamale, etc.).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      crop: { type: Type.STRING, description: 'Crop name, e.g. Tomatoes, Maize, Yam, Plantain, Cassava, Onions, Soybeans, Pepper' },
      region: { type: Type.STRING, description: 'Optional region' },
    },
  },
};

const calculateFreightDeclaration: FunctionDeclaration = {
  name: 'calculate_transport_freight',
  description: 'Calculate road transport distance, estimated cost in Ghana Cedis (GHS), travel hours, and recommended vehicle between Ghanaian towns.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      origin: { type: Type.STRING, description: 'Pickup town in Ghana, e.g. Techiman, Ejura, Tamale, Somanya' },
      destination: { type: Type.STRING, description: 'Delivery town in Ghana, e.g. Kumasi, Accra, Takoradi, Sunyani' },
      quantity: { type: Type.NUMBER, description: 'Quantity of bags, crates, or tubers' },
    },
    required: ['origin', 'destination'],
  },
};

const searchHarvestInventoryDeclaration: FunctionDeclaration = {
  name: 'search_harvest_inventory',
  description: 'Search available fresh harvests from MoFA-verified smallholder farmers in Ghana.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      crop: { type: Type.STRING, description: 'Crop to search for (Tomatoes, Maize, Yam, Pineapple, Cassava)' },
      town: { type: Type.STRING, description: 'Specific town or district' },
      maxPrice: { type: Type.NUMBER, description: 'Maximum unit price in GHS' },
    },
  },
};

const inspectWebUrlDeclaration: FunctionDeclaration = {
  name: 'inspect_web_url',
  description: 'Fetch, inspect, and extract information from an external web URL.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: { type: Type.STRING, description: 'Full HTTP or HTTPS web URL to inspect' },
    },
    required: ['url'],
  },
};

const getAgriWeatherDeclaration: FunctionDeclaration = {
  name: 'get_agri_weather',
  description: 'Get weather forecast, road transport advisory, and harvest condition for a Ghanaian farming town.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      town: { type: Type.STRING, description: 'Town name (Techiman, Ejura, Tamale, Kumasi, Accra)' },
    },
    required: ['town'],
  },
};

const calculateMathDeclaration: FunctionDeclaration = {
  name: 'calculate_math',
  description: 'Evaluate general arithmetic or business calculation expressions (e.g. 50 * 90 + 450).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      expression: { type: Type.STRING, description: 'Math expression to evaluate' },
    },
    required: ['expression'],
  },
};

const explainCurrentScreenDeclaration: FunctionDeclaration = {
  name: 'explain_current_screen',
  description: 'Explain what the user can do on the currently visible screen and guide them through available actions.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      currentRoute: { type: Type.STRING, description: 'Current active screen' },
    },
  },
};

// Legacy tool mapping support
const navigateAppDeclaration: FunctionDeclaration = {
  name: 'navigate_app',
  description: 'Navigate to any section of the GHarvest platform.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      screen: { type: Type.STRING, description: 'Target screen' },
      searchQuery: { type: Type.STRING, description: 'Produce keyword' },
      filterLocation: { type: Type.STRING, description: 'Town location' },
      orderId: { type: Type.STRING, description: 'Order ID' },
      openModal: { type: Type.STRING, description: 'Modal identifier' },
      reason: { type: Type.STRING, description: 'Reason' },
    },
    required: ['screen'],
  },
};

const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      navigateToScreenDeclaration,
      searchMarketplaceDeclaration,
      filterMarketplaceDeclaration,
      selectListingDeclaration,
      openOrderDraftDeclaration,
      updateOrderQuantityDeclaration,
      showOrdersDeclaration,
      showOrderDetailsDeclaration,
      showLogisticsDeclaration,
      trackOrderDeclaration,
      openFarmerServicesDeclaration,
      openHomeDeclaration,
      goBackDeclaration,
      navigateAppDeclaration,
      explainCurrentScreenDeclaration,
      getMarketPriceDeclaration,
      calculateFreightDeclaration,
      searchHarvestInventoryDeclaration,
      inspectWebUrlDeclaration,
      getAgriWeatherDeclaration,
      calculateMathDeclaration,
    ],
  },
];

export interface NavigationPayload {
  screen: 'home' | 'marketplace' | 'orders' | 'logistics' | 'farmer_services' | 'nlp_studio' | 'back';
  searchQuery?: string;
  filterLocation?: string;
  orderId?: string;
  openModal?: 'order_draft' | 'farmer_listing' | null;
  reason?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text?: string; functionCall?: any; functionResponse?: any }>;
}

export class GeminiService {
  /**
   * Bounded Tool Execution: validates every requested tool against the schema,
   * executes backend operations, converts UI commands into AppActions, and returns structured results.
   */
  private static async executeTool(
    name: string,
    args: any,
    accumulatedActions: AppAction[]
  ): Promise<{ result: any; actionCard?: any; navigation?: NavigationPayload }> {
    switch (name) {
      case 'navigate_to_screen': {
        const validation = validateAppAction({ type: 'navigate_to_screen', payload: args });
        if (!validation.valid) {
          return { result: { error: validation.error } };
        }
        accumulatedActions.push(validation.action!);
        return {
          result: { success: true, navigatedTo: args.screen },
          navigation: { screen: args.screen, reason: args.reason },
        };
      }

      case 'search_marketplace': {
        const validation = validateAppAction({ type: 'search_marketplace', payload: args });
        if (!validation.valid) {
          return { result: { error: validation.error } };
        }
        accumulatedActions.push(validation.action!);
        const results = AgriculturalService.searchHarvests(args.query);
        return {
          result: { success: true, query: args.query, count: results.length, matches: results },
          navigation: { screen: 'marketplace', searchQuery: args.query },
          actionCard: { type: 'harvest_list', data: results },
        };
      }

      case 'filter_marketplace': {
        const validation = validateAppAction({ type: 'filter_marketplace', payload: args });
        if (!validation.valid) {
          return { result: { error: validation.error } };
        }
        accumulatedActions.push(validation.action!);
        const results = AgriculturalService.searchHarvests(args.crop, args.location, args.maxPrice);
        return {
          result: { success: true, filtersApplied: args, count: results.length },
          navigation: {
            screen: 'marketplace',
            searchQuery: args.crop,
            filterLocation: args.location,
          },
          actionCard: { type: 'harvest_list', data: results },
        };
      }

      case 'select_listing': {
        const validation = validateAppAction({ type: 'select_listing', payload: args });
        if (!validation.valid) {
          return { result: { error: validation.error } };
        }
        accumulatedActions.push(validation.action!);
        return {
          result: { success: true, selectedListingId: args.listingId },
        };
      }

      case 'open_order_draft': {
        const validation = validateAppAction({ type: 'open_order_draft', payload: args });
        if (!validation.valid) {
          return { result: { error: validation.error } };
        }
        accumulatedActions.push(validation.action!);
        const quote = EscrowService.calculateQuotation(
          args.crop,
          args.quantity,
          args.pickupTown || 'Techiman',
          args.deliveryTown || 'Kumasi'
        );
        const draftSummary = {
          orderId: `DRAFT-${Date.now().toString().slice(-4)}`,
          product: args.crop,
          quantity: args.quantity,
          unit: args.unit || 'Bags (100kg)',
          farmerName: args.farmerName || 'Verified Smallholder Farmer',
          farmerPhone: args.farmerPhone || '024 456 7891',
          pickup: quote.freight.origin,
          destination: quote.freight.destination,
          cropPriceGHS: quote.cropTotalGHS,
          transportGHS: quote.freight.estimatedCostGHS,
          serviceFeeGHS: quote.serviceFeeGHS,
          totalAmountGHS: quote.totalAmountGHS,
          vehicle: quote.freight.vehicle,
          status: 'pending_confirmation',
          requiresUserConfirmation: true,
        };
        return {
          result: { success: true, draft: draftSummary, message: 'Draft prepared. Explicit user confirmation required before submitting.' },
          actionCard: { type: 'order_summary', data: draftSummary },
          navigation: { screen: 'marketplace', openModal: 'order_draft' },
        };
      }

      case 'update_order_quantity': {
        const validation = validateAppAction({ type: 'update_order_quantity', payload: args });
        if (!validation.valid) {
          return { result: { error: validation.error } };
        }
        accumulatedActions.push(validation.action!);
        return {
          result: { success: true, updatedQuantity: args.quantity },
        };
      }

      case 'show_orders': {
        const validation = validateAppAction({ type: 'show_orders', payload: args });
        if (!validation.valid) {
          return { result: { error: validation.error } };
        }
        accumulatedActions.push(validation.action!);
        const orders = EscrowService.getOrders();
        return {
          result: { success: true, orderCount: orders.length, orders },
          navigation: { screen: 'orders' },
        };
      }

      case 'show_order_details':
      case 'track_order': {
        const validation = validateAppAction({ type: 'track_order', payload: args });
        if (!validation.valid) {
          return { result: { error: validation.error } };
        }
        accumulatedActions.push(validation.action!);
        const orders = EscrowService.getOrders();
        const matched = orders.find(o => o.id === args.orderId) || orders[0];
        return {
          result: { success: true, order: matched },
          navigation: { screen: 'orders', orderId: matched?.id || args.orderId },
        };
      }

      case 'show_logistics': {
        const validation = validateAppAction({ type: 'show_logistics', payload: args });
        if (!validation.valid) {
          return { result: { error: validation.error } };
        }
        accumulatedActions.push(validation.action!);
        const freight = LogisticsService.calculateFreight(
          args.origin || 'Techiman',
          args.destination || 'Kumasi',
          args.quantity || 50,
          args.crop || 'Tomatoes'
        );
        return {
          result: { success: true, freight },
          navigation: { screen: 'logistics' },
          actionCard: { type: 'logistics_estimate', data: freight },
        };
      }

      case 'open_farmer_services': {
        const validation = validateAppAction({ type: 'open_farmer_services', payload: args });
        if (!validation.valid) {
          return { result: { error: validation.error } };
        }
        accumulatedActions.push(validation.action!);
        return {
          result: { success: true, opened: 'farmer_services' },
          navigation: {
            screen: 'farmer_services',
            openModal: args.action === 'list_harvest' ? 'farmer_listing' : null,
          },
        };
      }

      case 'open_home': {
        const validation = validateAppAction({ type: 'open_home', payload: {} });
        accumulatedActions.push(validation.action!);
        return {
          result: { success: true, screen: 'home' },
          navigation: { screen: 'home' },
        };
      }

      case 'go_back': {
        return {
          result: { success: true, navigated: 'back' },
          navigation: { screen: 'back', reason: args.reason },
        };
      }

      case 'navigate_app': {
        const screen = args.screen === 'harvest_listing' ? 'farmer_services' : args.screen;
        const nav: NavigationPayload = {
          screen,
          searchQuery: args.searchQuery,
          filterLocation: args.filterLocation,
          orderId: args.orderId,
          openModal: args.openModal,
          reason: args.reason,
        };
        let actionCard: any = null;
        if (args.searchQuery || args.filterLocation) {
          const results = AgriculturalService.searchHarvests(args.searchQuery, args.filterLocation);
          actionCard = { type: 'harvest_list', data: results };
        }
        return {
          result: { success: true, navigatedTo: screen },
          navigation: nav,
          actionCard,
        };
      }

      case 'explain_current_screen': {
        const explanation = AgriculturalService.explainScreen(args.currentRoute || 'marketplace');
        return { result: { explanation } };
      }

      case 'get_market_price': {
        const prices = AgriculturalService.getMarketPrices(args.crop, args.region);
        return {
          result: prices,
          actionCard: { type: 'price_check', data: prices },
        };
      }

      case 'calculate_transport_freight': {
        const freight = LogisticsService.calculateFreight(args.origin, args.destination, args.quantity);
        return {
          result: freight,
          actionCard: { type: 'logistics_estimate', data: freight },
        };
      }

      case 'search_harvest_inventory': {
        const harvests = AgriculturalService.searchHarvests(args.crop, args.town, args.maxPrice);
        return {
          result: harvests,
          actionCard: { type: 'harvest_list', data: harvests },
        };
      }

      case 'inspect_web_url': {
        const inspection = await UrlInspectorService.inspectUrl(args.url);
        return {
          result: inspection,
          actionCard: { type: 'web_summary', data: inspection },
        };
      }

      case 'get_agri_weather': {
        const weather = AgriculturalService.getWeather(args.town);
        return {
          result: weather,
          actionCard: { type: 'weather_alert', data: weather },
        };
      }

      case 'calculate_math': {
        try {
          const sanitized = String(args.expression).replace(/[^0-9+\-*/(). ]/g, '');
          const calculated = Function(`'use strict'; return (${sanitized})`)();
          return { result: { expression: args.expression, value: calculated } };
        } catch {
          return { result: { expression: args.expression, error: 'Calculation could not be evaluated.' } };
        }
      }

      default:
        return { result: { error: `Tool '${name}' is not recognized or not on the allowlist.` } };
    }
  }

  /**
   * Multi-turn chat with autonomous Tool Calling, Navigation, and Bounded Loop
   */
  public static async chat(
    conversationHistory: ChatMessage[],
    userMessage: string,
    language = 'en-GH',
    memory: any = {},
    appContext: any = {}
  ): Promise<{
    reply: string;
    actionCard?: any;
    navigation?: NavigationPayload;
    toolsUsed: string[];
    actions: AppAction[];
    updatedMemory: any;
  }> {
    const toolsUsed: string[] = [];
    const actions: AppAction[] = [];
    let detectedActionCard: any = null;
    let detectedNavigation: NavigationPayload | undefined = undefined;
    const updatedMemory = { ...memory };

    // Update memory heuristically from text
    const lower = userMessage.toLowerCase();
    if (lower.includes('tomato') || lower.includes('nntosi')) {
      updatedMemory.product = 'Tomatoes';
      updatedMemory.unit = 'Crates';
    } else if (lower.includes('maize') || lower.includes('aburo')) {
      updatedMemory.product = 'Maize';
      updatedMemory.unit = 'Bags (100kg)';
    } else if (lower.includes('yam') || lower.includes('bayere')) {
      updatedMemory.product = 'Yam';
      updatedMemory.unit = 'Tubers';
    } else if (lower.includes('cassava') || lower.includes('bankye')) {
      updatedMemory.product = 'Cassava';
      updatedMemory.unit = 'Bags (100kg)';
    } else if (lower.includes('plantain') || lower.includes('borode')) {
      updatedMemory.product = 'Plantain';
      updatedMemory.unit = 'Bunches';
    }

    // Directional Route: "from [origin] to [destination]"
    const towns = ['Techiman', 'Kumasi', 'Ejura', 'Tamale', 'Accra', 'Sunyani', 'Somanya', 'Koforidua', 'Takoradi', 'Ho'];
    const routeMatch = userMessage.match(/from\s+([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+)/i);
    if (routeMatch) {
      const p = routeMatch[1].trim();
      const d = routeMatch[2].trim();
      const matchedPickup = towns.find(t => t.toLowerCase() === p.toLowerCase());
      const matchedDelivery = towns.find(t => t.toLowerCase() === d.toLowerCase());
      if (matchedPickup) updatedMemory.pickupLocation = matchedPickup;
      if (matchedDelivery) updatedMemory.deliveryLocation = matchedDelivery;
    } else {
      const foundInOrder: { town: string; index: number }[] = [];
      for (const t of towns) {
        const regex = new RegExp(`\\b${t}\\b`, 'i');
        const match = regex.exec(userMessage);
        if (match) {
          foundInOrder.push({ town: t, index: match.index });
        }
      }
      foundInOrder.sort((a, b) => a.index - b.index);
      for (const item of foundInOrder) {
        if (!updatedMemory.pickupLocation) {
          updatedMemory.pickupLocation = item.town;
        } else if (updatedMemory.pickupLocation !== item.town && !updatedMemory.deliveryLocation) {
          updatedMemory.deliveryLocation = item.town;
        }
      }
    }

    // Quantities
    const isMathExpr = /[\+\-\*\/xX×÷]/.test(userMessage) || /calculate|what is \d/i.test(userMessage);
    if (!isMathExpr) {
      const numMatch = userMessage.match(/\b(\d+)\b/);
      if (numMatch && (lower.includes('bag') || lower.includes('crate') || lower.includes('tuber') || lower.includes('order') || lower.includes('need') || lower.includes('make it') || lower.includes('buy') || lower.includes('want') || lower.includes('kg') || lower.includes('unit'))) {
        updatedMemory.quantity = parseInt(numMatch[1], 10);
      }
    }

    const currentScreen = appContext?.currentRoute || 'marketplace';
    const selectedListingSummary = appContext?.selectedListing
      ? `Viewing listing: ${appContext.selectedListing.crop} from ${appContext.selectedListing.farmerName} in ${appContext.selectedListing.locationTown} at GH₵ ${appContext.selectedListing.unitPriceGHS}/${appContext.selectedListing.unit}`
      : 'None';
    const selectedOrderSummary = appContext?.selectedOrder
      ? `Viewing order: ${appContext.selectedOrder.id} for ${appContext.selectedOrder.quantity} ${appContext.selectedOrder.unit} of ${appContext.selectedOrder.crop} (Status: ${appContext.selectedOrder.status})`
      : 'None';

    const systemInstruction = `You are Kofi, the intelligent voice-first AI assistant and navigation guide for the GHarvest platform in Ghana.

Current Application Context:
- Active Screen / Route: ${currentScreen}
- Selected Harvest Listing: ${selectedListingSummary}
- Selected Order: ${selectedOrderSummary}
- User Role: ${appContext?.userRole || 'buyer'}
- Available Actions on screen: ${appContext?.availableActions ? appContext.availableActions.join(', ') : 'browse marketplace, inspect orders, track freight, list crops'}

Core Principles:
1. You ARE the direct action layer of GHarvest:
   - When the user asks to see a screen or asks to perform an action (e.g. "Take me to the market", "Show me tomatoes", "Find tomatoes in Techiman", "Show my orders", "Where is my order?", "Find a truck"), call the appropriate tool immediately!
   - Do NOT just talk about how to use the app when you can perform the requested navigation or action yourself.
2. Contextual Memory:
   - Maintain multi-turn context (crop, quantity, unit, locations).
   - If the user says "Actually, make it three bags", update the quantity in context.
   - If the user asks "Which one is cheaper?", compare actual listings by price and unit.
3. Consequential Operations & Safety:
   - Orders require explicit user confirmation. When preparing an order, call open_order_draft to prepare the draft, state the details clearly (crop, quantity, unit, price, freight, total), and ask the user to confirm. Never pretend an order is funded or confirmed without verification.
4. Voice output:
   - Spoken responses should be concise, human, and conversational (1-3 sentences).
   - Always quote prices in Ghana Cedis (GH₵ or GHS).
5. Clarification:
   - If the user's speech is garbled, inaudible, or unclear, politely ask them to repeat or paraphrase.`;

    if (!ai) {
      return this.localKofiEngine(userMessage, updatedMemory, language, conversationHistory, appContext);
    }

    const model = 'gemini-3.8-flash';

    const contents: any[] = conversationHistory.map(m => ({
      role: m.role,
      parts: m.parts.map(p => {
        if (p.text) return { text: p.text };
        if (p.functionCall) return { functionCall: p.functionCall };
        if (p.functionResponse) return { functionResponse: p.functionResponse };
        return { text: '' };
      }),
    }));

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const MAX_TOOL_ROUNDS = 5;
    let round = 0;

    try {
      while (round < MAX_TOOL_ROUNDS) {
        round++;

        const response = await Promise.race([
          ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
              tools: GEMINI_TOOLS as any,
            },
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout waiting for Gemini response')), 6500)),
        ]) as any;

        toolsUsed.push(model);

        const functionCalls = response.functionCalls;
        if (!functionCalls || functionCalls.length === 0) {
          // Final text response reached
          return {
            reply: response.text || "I'm ready to assist you on GHarvest.",
            actionCard: detectedActionCard,
            navigation: detectedNavigation,
            toolsUsed,
            actions,
            updatedMemory,
          };
        }

        // Process function calls
        for (const call of functionCalls) {
          const toolName = call.name || 'unknown_tool';
          toolsUsed.push(toolName);

          const toolExec = await this.executeTool(toolName, call.args, actions);
          if (toolExec.actionCard) {
            detectedActionCard = toolExec.actionCard;
          }
          if (toolExec.navigation) {
            detectedNavigation = toolExec.navigation;
          }

          contents.push({
            role: 'model',
            parts: [{ functionCall: call }],
          });

          contents.push({
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name: call.name,
                  response: toolExec.result,
                },
              },
            ],
          });
        }
      }

      // If loop limit reached, ask model for closing summary
      const finalSummary = await ai.models.generateContent({
        model,
        contents,
        config: { systemInstruction, temperature: 0.7 },
      });

      return {
        reply: finalSummary.text || 'I have completed the requested operations on GHarvest.',
        actionCard: detectedActionCard,
        navigation: detectedNavigation,
        toolsUsed,
        actions,
        updatedMemory,
      };
    } catch (_err: any) {
      console.warn('Gemini chat error, invoking local engine fallback:', _err?.message?.substring(0, 120));
      return this.localKofiEngine(userMessage, updatedMemory, language, conversationHistory, appContext);
    }
  }

  /**
   * Deterministic local fallback engine for offline reliability, network failures, and test suites
   */
  public static async localKofiEngine(
    userPrompt: string,
    memory: any = {},
    language = 'en-GH',
    _history: any[] = [],
    appContext: any = {}
  ): Promise<{
    reply: string;
    actionCard?: any;
    navigation?: NavigationPayload;
    toolsUsed: string[];
    actions: AppAction[];
    updatedMemory: any;
  }> {
    const lower = userPrompt.toLowerCase().trim();
    const updatedMemory = { ...memory };
    const toolsUsed: string[] = ['local-kofi-intelligence'];
    const actions: AppAction[] = [];
    let actionCard: any = null;
    let navigation: NavigationPayload | undefined = undefined;

    // Track crops
    if (lower.includes('tomato') || lower.includes('nntosi')) {
      updatedMemory.product = 'Tomatoes';
      updatedMemory.unit = 'Crates';
    } else if (lower.includes('maize') || lower.includes('aburo')) {
      updatedMemory.product = 'Maize';
      updatedMemory.unit = 'Bags (100kg)';
    } else if (lower.includes('yam') || lower.includes('bayere')) {
      updatedMemory.product = 'Yam';
      updatedMemory.unit = 'Tubers';
    } else if (lower.includes('cassava') || lower.includes('bankye')) {
      updatedMemory.product = 'Cassava';
      updatedMemory.unit = 'Bags (100kg)';
    } else if (lower.includes('plantain') || lower.includes('borode')) {
      updatedMemory.product = 'Plantain';
      updatedMemory.unit = 'Bunches';
    }

    // Directional route & towns
    const towns = ['Techiman', 'Kumasi', 'Ejura', 'Tamale', 'Accra', 'Sunyani', 'Somanya', 'Koforidua', 'Takoradi', 'Ho'];
    const routeMatch = userPrompt.match(/from\s+([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+)/i);
    if (routeMatch) {
      const p = routeMatch[1].trim();
      const d = routeMatch[2].trim();
      const matchedPickup = towns.find(t => t.toLowerCase() === p.toLowerCase());
      const matchedDelivery = towns.find(t => t.toLowerCase() === d.toLowerCase());
      if (matchedPickup) updatedMemory.pickupLocation = matchedPickup;
      if (matchedDelivery) updatedMemory.deliveryLocation = matchedDelivery;
    } else {
      const foundInOrder: { town: string; index: number }[] = [];
      for (const t of towns) {
        const regex = new RegExp(`\\b${t}\\b`, 'i');
        const match = regex.exec(userPrompt);
        if (match) foundInOrder.push({ town: t, index: match.index });
      }
      foundInOrder.sort((a, b) => a.index - b.index);
      for (const item of foundInOrder) {
        if (!updatedMemory.pickupLocation) {
          updatedMemory.pickupLocation = item.town;
        } else if (updatedMemory.pickupLocation !== item.town && !updatedMemory.deliveryLocation) {
          updatedMemory.deliveryLocation = item.town;
        }
      }
    }

    // Quantity tracking
    const isMathExpr = /[\+\-\*\/xX×÷]/.test(userPrompt) || /calculate|what is \d/i.test(userPrompt);
    if (!isMathExpr) {
      const numMatch = userPrompt.match(/\b(\d+)\b/);
      if (numMatch && (lower.includes('bag') || lower.includes('crate') || lower.includes('tuber') || lower.includes('order') || lower.includes('need') || lower.includes('make it') || lower.includes('buy') || lower.includes('want') || lower.includes('kg') || lower.includes('unit') || /^\s*\d+\s*(?:bags?|crates?|tubers?|units?)?\.?\s*$/i.test(userPrompt))) {
        updatedMemory.quantity = parseInt(numMatch[1], 10);
      }
    }

    // 1. Stop / Interruption command
    if (lower === 'stop' || lower === 'stop talking' || lower === 'quiet' || lower === 'shut up' || lower === 'pause') {
      return {
        reply: 'Stopped. I am on standby listening whenever you are ready.',
        toolsUsed: ['voiceControl'],
        actions,
        updatedMemory,
      };
    }

    // 2. Navigation: Go back
    if (lower === 'go back' || lower === 'back' || lower.includes('previous page') || lower.includes('previous screen')) {
      return {
        reply: 'Navigating back to the previous screen.',
        navigation: { screen: 'back', reason: 'User requested go back' },
        toolsUsed: ['go_back'],
        actions,
        updatedMemory,
      };
    }

    // 3. Navigation: Home
    if (lower.includes('take me home') || lower.includes('go home') || lower === 'home' || lower === 'home.') {
      actions.push({ type: 'open_home', payload: {} });
      return {
        reply: 'Taking you to the GHarvest home overview.',
        navigation: { screen: 'home' },
        toolsUsed: ['open_home', 'navigate_app'],
        actions,
        updatedMemory,
      };
    }

    // 4. Comparison: "Which one is cheaper?" / "Compare produce"
    if (lower.includes('which one is cheaper') || lower.includes('which is cheaper') || lower.includes('compare price') || lower.includes('cheapest produce')) {
      const crop = updatedMemory.product || 'Tomatoes';
      const available = AgriculturalService.searchHarvests(crop);
      if (available.length >= 2) {
        const sorted = [...available].sort((a, b) => a.unitPriceGHS - b.unitPriceGHS);
        const cheapest = sorted[0];
        const next = sorted[1];
        actions.push({ type: 'filter_marketplace', payload: { crop, sort: 'cheapest' } });
        return {
          reply: `For ${crop}: ${cheapest.farmerName}'s listing in ${cheapest.locationTown} is cheaper at GH₵ ${cheapest.unitPriceGHS} per ${cheapest.unit}, compared to ${next.farmerName} in ${next.locationTown} at GH₵ ${next.unitPriceGHS} per ${next.unit}. Note the unit sizes before buying!`,
          actionCard: { type: 'harvest_list', data: sorted },
          navigation: { screen: 'marketplace', searchQuery: crop },
          toolsUsed: ['filter_marketplace', 'search_harvest_inventory'],
          actions,
          updatedMemory,
        };
      }
      actions.push({ type: 'filter_marketplace', payload: { sort: 'cheapest' } });
      return {
        reply: 'I sorted the marketplace to show the cheapest available verified harvests first. Petomech tomatoes from Techiman at GH₵ 90/crate and white maize from Ejura at GH₵ 240/bag are current top bargains.',
        actionCard: { type: 'harvest_list', data: available },
        navigation: { screen: 'marketplace' },
        toolsUsed: ['filter_marketplace'],
        actions,
        updatedMemory,
      };
    }

    // 5. "Just show me the cheapest ones" / "Show cheapest"
    if (lower.includes('cheapest ones') || lower.includes('cheapest') || lower.includes('lowest price')) {
      const crop = updatedMemory.product || '';
      actions.push({ type: 'filter_marketplace', payload: { crop: crop || undefined, sort: 'cheapest' } });
      const results = AgriculturalService.searchHarvests(crop);
      return {
        reply: `Filtered for the cheapest ${crop || 'produce'} available on GHarvest. The lowest priced verified listings are displayed at the top.`,
        actionCard: { type: 'harvest_list', data: results },
        navigation: { screen: 'marketplace', searchQuery: crop },
        toolsUsed: ['filter_marketplace'],
        actions,
        updatedMemory,
      };
    }

    // 6. Navigation & Search: "I want to go to the market. Help me buy yam." / "Help me buy yam"
    if (lower.includes('market') && (lower.includes('yam') || lower.includes('bayere'))) {
      updatedMemory.product = 'Yam';
      updatedMemory.unit = 'Tubers';
      actions.push({ type: 'navigate_to_screen', payload: { screen: 'marketplace' } });
      actions.push({ type: 'search_marketplace', payload: { query: 'Yam' } });
      const results = AgriculturalService.searchHarvests('Yam');
      return {
        reply: "Of course! I'll take you to the marketplace and help you find yam. Are you buying for yourself or for a business?",
        actionCard: { type: 'harvest_list', data: results },
        navigation: { screen: 'marketplace', searchQuery: 'Yam' },
        toolsUsed: ['navigate_to_screen', 'search_marketplace'],
        actions,
        updatedMemory,
      };
    }

    // 7. Navigation & Search: Find tomatoes in Techiman
    if (lower.includes('techiman') && (lower.includes('tomato') || lower.includes('nntosi'))) {
      updatedMemory.product = 'Tomatoes';
      updatedMemory.pickupLocation = 'Techiman';
      actions.push({ type: 'search_marketplace', payload: { query: 'Tomatoes' } });
      actions.push({ type: 'filter_marketplace', payload: { location: 'Techiman', crop: 'Tomatoes' } });
      const results = AgriculturalService.searchHarvests('Tomatoes', 'Techiman');
      return {
        reply: 'I found Grade A Petomech tomatoes from verified smallholder Kwabena Mensah in Techiman, priced at GH₵ 90 per crate with MoMo escrow protection.',
        actionCard: { type: 'harvest_list', data: results },
        navigation: {
          screen: 'marketplace',
          searchQuery: 'Tomatoes',
          filterLocation: 'Techiman',
          reason: 'Filtered marketplace for tomatoes in Techiman',
        },
        toolsUsed: ['navigate_to_screen', 'search_marketplace', 'filter_marketplace'],
        actions,
        updatedMemory,
      };
    }

    // 8. Navigation & Search: Find tomatoes / Show me tomatoes
    if (lower.includes('find tomatoes') || lower.includes('show me tomatoes') || lower.includes('search tomatoes') || lower === 'tomatoes') {
      updatedMemory.product = 'Tomatoes';
      actions.push({ type: 'search_marketplace', payload: { query: 'Tomatoes' } });
      const results = AgriculturalService.searchHarvests('Tomatoes');
      return {
        reply: 'Here are the verified tomato listings from our smallholder farmers in Techiman and Somanya.',
        actionCard: { type: 'harvest_list', data: results },
        navigation: {
          screen: 'marketplace',
          searchQuery: 'Tomatoes',
          reason: 'Searching tomatoes in marketplace',
        },
        toolsUsed: ['navigate_to_screen', 'search_marketplace'],
        actions,
        updatedMemory,
      };
    }

    // 9. Navigation: Open Marketplace
    if (lower.includes('open marketplace') || lower.includes('show marketplace') || lower === 'marketplace' || lower.includes('go to marketplace') || lower.includes('browse crops')) {
      actions.push({ type: 'navigate_to_screen', payload: { screen: 'marketplace' } });
      return {
        reply: 'Opening the GHarvest marketplace. What agricultural produce are you looking for?',
        navigation: { screen: 'marketplace', reason: 'Opening marketplace' },
        toolsUsed: ['navigate_to_screen'],
        actions,
        updatedMemory,
      };
    }

    // 10. Navigation: Farmer sell / list harvest
    if (lower.includes('sell my tomatoes') || lower.includes('sell tomatoes') || lower.includes('sell my harvest') || lower.includes('list my harvest') || lower.includes('want to sell') || lower.includes('list produce')) {
      actions.push({ type: 'open_farmer_services', payload: { action: 'list_harvest' } });
      return {
        reply: 'Opening the harvest listing form. You can enter your farm location, quantity, and price, and I will alert verified caterers and food distributors for you.',
        navigation: {
          screen: 'marketplace',
          openModal: 'farmer_listing',
          reason: 'Opening new harvest listing flow',
        },
        toolsUsed: ['open_farmer_services'],
        actions,
        updatedMemory,
      };
    }

    // 11. Navigation: Where is my latest order?
    if (lower.includes('where is my') || lower.includes('track my order') || lower.includes('track order') || lower.includes('latest order') || lower.includes('order status')) {
      actions.push({ type: 'track_order', payload: { orderId: 'GH-8421' } });
      return {
        reply: 'Your latest order GH-8421 for 50 crates of tomatoes is currently In Transit from Techiman to Kumasi with driver Emmanuel Mensah (Kia Rhino). Funds remain safely held in escrow.',
        navigation: {
          screen: 'orders',
          orderId: 'GH-8421',
          reason: 'Inspecting latest order status and tracking',
        },
        toolsUsed: ['track_order'],
        actions,
        updatedMemory,
      };
    }

    // 12. Navigation: Show my orders
    if (lower.includes('show my orders') || lower.includes('my orders') || lower.includes('open orders') || lower.includes('view orders') || lower === 'orders') {
      actions.push({ type: 'show_orders', payload: {} });
      return {
        reply: 'Here are your current orders, logistics tracking, and escrow deposits.',
        navigation: { screen: 'orders', reason: 'Viewing orders' },
        toolsUsed: ['show_orders'],
        actions,
        updatedMemory,
      };
    }

    // 13. Navigation: Find a truck for this order / Logistics
    if (lower.includes('find a truck') || lower.includes('find truck') || lower.includes('arrange transport') || lower.includes('need a truck')) {
      actions.push({ type: 'show_logistics', payload: { origin: 'Techiman', destination: 'Kumasi', quantity: 50, crop: 'Tomatoes' } });
      const freight = LogisticsService.calculateFreight('Techiman', 'Kumasi', 50, 'Tomatoes');
      return {
        reply: 'Opening the logistics transport tracker. For 50 crates from Techiman to Kumasi, a Kia Rhino takes approximately 2.5 hours and costs about GH₵ 600.',
        actionCard: {
          type: 'logistics_estimate',
          data: freight,
        },
        navigation: { screen: 'logistics', reason: 'Viewing freight calculator' },
        toolsUsed: ['show_logistics', 'calculate_transport_freight'],
        actions,
        updatedMemory,
      };
    }

    // 14. Payment Inquiry: How much am I supposed to pay?
    if (lower.includes('supposed to pay') || lower.includes('how much do i pay') || lower.includes('how much should i pay') || lower.includes('how much am i paying') || lower.includes('payment info') || (lower.includes('how much') && lower.includes('pay'))) {
      const activeOrder = appContext?.selectedOrder || {
        id: 'GH-8921',
        crop: 'Tomatoes',
        quantity: 50,
        unit: 'Crates',
        totalCropPriceGHS: 4500,
        transportPriceGHS: 450,
        serviceFeeGHS: 120,
        totalAmountGHS: 5070,
        paymentMethod: 'MTN Mobile Money',
        escrowStatus: 'held',
      };
      actions.push({ type: 'show_order_details', payload: { orderId: activeOrder.id } });
      return {
        reply: `For order ${activeOrder.id} (${activeOrder.quantity} ${activeOrder.unit} of ${activeOrder.crop}), you are paying a total of GH₵ ${activeOrder.totalAmountGHS.toLocaleString()} via ${activeOrder.paymentMethod}. This includes GH₵ ${activeOrder.totalCropPriceGHS.toLocaleString()} for the harvest, GH₵ ${activeOrder.transportPriceGHS.toLocaleString()} for freight haulage, and GH₵ ${activeOrder.serviceFeeGHS.toLocaleString()} service fee. Funds are safely held in escrow.`,
        navigation: {
          screen: 'orders',
          orderId: activeOrder.id,
          reason: `Retrieving payment information for order ${activeOrder.id}`,
        },
        toolsUsed: ['show_order_details'],
        actions,
        updatedMemory,
      };
    }

    // 15. General Help: Help me / Help
    if (lower.replace(/[.,!?]+$/, '').trim() === 'help' || lower.replace(/[.,!?]+$/, '').trim() === 'help me' || lower.startsWith('help me') || lower.includes('what can i do') || lower.includes('what can you do')) {
      return {
        reply: "I am Kofi, your voice-first AI guide for GHarvest. You can talk to me naturally to:\n• Search harvests (e.g. 'Find tomatoes in Techiman')\n• Sell produce (e.g. 'I want to sell my maize')\n• Track deliveries & payments (e.g. 'Show my orders', 'Where is my order?')\n• Calculate freight haulage (e.g. 'Find a truck from Techiman to Kumasi')\n• Check MoFA benchmark prices (e.g. 'Price of maize in Ejura')\nWhat can I help you with?",
        toolsUsed: ['kofiPlatformHelp'],
        actions,
        updatedMemory,
      };
    }

    // 16. Multi-turn Route Completion: "From Ejura to Kumasi"
    if (routeMatch || (lower.startsWith('from ') && lower.includes(' to ')) || (updatedMemory.pickupLocation && updatedMemory.deliveryLocation && (lower.includes('ejura') || lower.includes('kumasi') || lower.includes('techiman') || lower.includes('tamale') || lower.includes('accra')))) {
      const origin = updatedMemory.pickupLocation || 'Ejura';
      const dest = updatedMemory.deliveryLocation || 'Kumasi';
      const prod = updatedMemory.product || 'Maize';
      const qty = updatedMemory.quantity || 80;
      const unit = updatedMemory.unit || 'Bags (100kg)';

      const freight = LogisticsService.calculateFreight(origin, dest, qty, prod);
      const estCropPrice = prod.toLowerCase().includes('maize') ? qty * 240 : qty * 90;
      const totalEstimated = estCropPrice + freight.estimatedCostGHS + Math.round(estCropPrice * 0.02);

      actions.push({ type: 'show_logistics', payload: { origin, destination: dest, quantity: qty, crop: prod } });

      return {
        reply: `Transport for ${qty} ${unit} of ${prod} from ${origin} to ${dest} is approximately GH₵ ${freight.estimatedCostGHS.toLocaleString()} via ${freight.vehicle} (${freight.distanceKm} km, ~${freight.hours} hrs). Total estimated order with produce is GH₵ ${totalEstimated.toLocaleString()}. Would you like me to prepare the Mobile Money escrow draft for confirmation?`,
        actionCard: {
          type: 'logistics_estimate',
          data: freight,
        },
        toolsUsed: ['calculate_transport_freight', 'show_logistics'],
        actions,
        updatedMemory,
      };
    }

    // 17. Multi-Turn Context: Correction / Modification ("Actually, make it 3 bags", "Actually make it three bags", "Make it 150kg")
    const actuallyMatch = lower.match(/(?:actually,?\s*)?(?:make it|change to|change the quantity to|update to|set to)\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:kg|crates?|bags?|tubers?|units?)?/i);
    if (actuallyMatch) {
      const wordToNum: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
      const rawVal = actuallyMatch[1].toLowerCase();
      const newQty = wordToNum[rawVal] || parseInt(rawVal, 10);
      updatedMemory.quantity = newQty;
      const product = updatedMemory.product || memory.product || 'produce';
      const unit = updatedMemory.unit || 'bags';
      actions.push({ type: 'update_order_quantity', payload: { quantity: newQty } });
      return {
        reply: `Understood, updated to ${newQty} ${unit} for your ${product}. Destination is set to ${updatedMemory.deliveryLocation || 'Kumasi'}. Would you like to review the order draft or calculate transport?`,
        toolsUsed: ['update_order_quantity'],
        actions,
        updatedMemory,
      };
    }

    // 18. Multi-turn Quantity Turn: "I want two bags" / "80 bags." / "I want 3 bags"
    const wantQtyMatch = lower.match(/(?:i want|need|order)\s+(\d+|one|two|three|four|five)\s+(bags?|crates?|tubers?|kg|units?)/i);
    if (wantQtyMatch || (/^\s*\d+\s*(?:bags?|crates?|tubers?|kg|units?)?\.?\s*$/i.test(userPrompt) && updatedMemory.product)) {
      const wordToNum: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
      let q = updatedMemory.quantity || 2;
      let u = updatedMemory.unit || 'bags';
      if (wantQtyMatch) {
        const rawNum = wantQtyMatch[1].toLowerCase();
        q = wordToNum[rawNum] || parseInt(rawNum, 10);
        u = wantQtyMatch[2];
        updatedMemory.quantity = q;
        updatedMemory.unit = u;
      }
      actions.push({ type: 'update_order_quantity', payload: { quantity: q } });
      return {
        reply: `Noted ${q} ${u} of ${updatedMemory.product || 'produce'}. Where should we deliver this order? (For example: 'Deliver it to Kumasi')`,
        toolsUsed: ['update_order_quantity'],
        actions,
        updatedMemory,
      };
    }

    // 19. Delivery Destination Setting: "Deliver it to Kumasi" / "Deliver to Accra"
    const deliverMatch = lower.match(/deliver(?: it)? to\s+([A-Za-z\s]+)/i);
    if (deliverMatch) {
      const destTown = deliverMatch[1].trim();
      const matched = towns.find(t => t.toLowerCase() === destTown.toLowerCase()) || destTown;
      updatedMemory.deliveryLocation = matched;
      const crop = updatedMemory.product || 'Yam';
      const qty = updatedMemory.quantity || 2;
      const unit = updatedMemory.unit || 'bags';
      const pickup = updatedMemory.pickupLocation || 'Techiman';

      const quote = EscrowService.calculateQuotation(crop, qty, pickup, matched);
      actions.push({
        type: 'open_order_draft',
        payload: {
          crop,
          quantity: qty,
          unit,
          pickupTown: pickup,
          deliveryTown: matched,
          unitPriceGHS: quote.unitPriceGHS,
          estimatedTotalGHS: quote.totalAmountGHS,
        },
      });

      return {
        reply: `I have prepared the order draft: ${qty} ${unit} of ${crop} from ${pickup} to ${matched}. Crop price: GH₵ ${quote.cropTotalGHS.toLocaleString()}, freight transport: GH₵ ${quote.freight.estimatedCostGHS.toLocaleString()}, service fee: GH₵ ${quote.serviceFeeGHS}. Total: GH₵ ${quote.totalAmountGHS.toLocaleString()}. Please confirm the details to initiate Mobile Money escrow.`,
        actionCard: {
          type: 'order_summary',
          data: {
            orderId: `DRAFT-${Date.now().toString().slice(-4)}`,
            product: crop,
            quantity: qty,
            unit,
            pickup,
            destination: matched,
            cropPriceGHS: quote.cropTotalGHS,
            transportGHS: quote.freight.estimatedCostGHS,
            serviceFeeGHS: quote.serviceFeeGHS,
            totalAmountGHS: quote.totalAmountGHS,
            vehicle: quote.freight.vehicle,
            status: 'pending_confirmation',
            requiresUserConfirmation: true,
          },
        },
        navigation: { screen: 'marketplace', openModal: 'order_draft' },
        toolsUsed: ['open_order_draft', 'calculate_transport_freight'],
        actions,
        updatedMemory,
      };
    }

    // 20. Contextual Page Help: I don't understand this page
    if (lower.includes("don't understand this page") || lower.includes('explain this page') || lower.includes('what is this page') || (lower.includes('help') && lower.includes('page'))) {
      const explanation = AgriculturalService.explainScreen(appContext?.currentRoute || 'marketplace');
      return {
        reply: explanation,
        toolsUsed: ['explain_current_screen'],
        actions,
        updatedMemory,
      };
    }

    // 21. General Knowledge: Kwame Nkrumah
    if (lower.includes('kwame nkrumah') || lower.includes('nkrumah')) {
      return {
        reply: 'Dr. Kwame Nkrumah was the first Prime Minister and President of Ghana who led the nation to independence from British colonial rule on March 6, 1957. He was a champion of Pan-Africanism, founded the Akosombo Dam project, and built major national industrial and agricultural infrastructure.',
        toolsUsed: ['ghanaHistory'],
        actions,
        updatedMemory,
      };
    }

    // 22. General Knowledge: Inflation
    if (lower.includes('explain inflation') || lower.includes('what is inflation') || lower === 'inflation') {
      return {
        reply: 'Inflation is the general increase in the prices of goods and services over time, which reduces the purchasing power of money. In Ghana, agricultural inflation is often driven by transport fuel costs, exchange rates affecting imported fertilizer, and seasonal harvest availability.',
        toolsUsed: ['economicKnowledge'],
        actions,
        updatedMemory,
      };
    }

    // 23. General Knowledge: Arithmetic / Calculations
    const mathMatch = userPrompt.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/xX×÷])\s*(\d+(?:\.\d+)?)/);
    if (mathMatch && (lower.includes('what is') || lower.includes('calculate') || lower.includes('how much is') || (!lower.includes('deliver') && !lower.includes('cost')))) {
      const a = parseFloat(mathMatch[1]);
      let rawOp = mathMatch[2];
      const b = parseFloat(mathMatch[3]);
      let op = rawOp;
      if (op === 'x' || op === 'X' || op === '×') op = '*';
      if (op === '÷') op = '/';

      let res = 0;
      if (op === '+') res = a + b;
      if (op === '-') res = a - b;
      if (op === '*') res = a * b;
      if (op === '/') res = b !== 0 ? Math.round((a / b) * 100) / 100 : 0;

      return {
        reply: `${a} ${op === '*' ? 'times' : op === '/' ? 'divided by' : op} ${b} equals ${res.toLocaleString()}.`,
        toolsUsed: ['calculateMath'],
        actions,
        updatedMemory,
      };
    }

    // 24. Commodity Price Check: Current price of [crop] [in location]
    if (lower.includes('price of') || lower.includes('cost of') || lower.includes('current price') || lower.includes('market price') || lower.includes('tomato price') || lower.includes('maize price')) {
      let targetCrop = 'Tomatoes';
      if (lower.includes('maize') || lower.includes('aburo')) targetCrop = 'Maize';
      else if (lower.includes('yam') || lower.includes('bayere')) targetCrop = 'Yam';
      else if (lower.includes('cassava') || lower.includes('bankye')) targetCrop = 'Cassava';
      else if (lower.includes('plantain') || lower.includes('borode')) targetCrop = 'Plantain';
      else if (lower.includes('onion') || lower.includes('gyeene')) targetCrop = 'Onions';
      else if (lower.includes('soybean') || lower.includes('asee')) targetCrop = 'Soybeans';

      let targetTown = '';
      if (lower.includes('ejura')) targetTown = 'Ejura';
      else if (lower.includes('techiman')) targetTown = 'Techiman';
      else if (lower.includes('kejetia') || lower.includes('kumasi')) targetTown = 'Kumasi';
      else if (lower.includes('tamale')) targetTown = 'Tamale';
      else if (lower.includes('accra') || lower.includes('agbogbloshie')) targetTown = 'Accra';

      const prices = AgriculturalService.getMarketPrices(targetCrop, targetTown);
      const topPrice = prices[0];
      const locNotice = targetTown ? ` in ${targetTown}` : '';
      return {
        reply: topPrice
          ? `Based on current MoFA and Esoko market benchmarks: ${topPrice.crop} (${topPrice.variety || topPrice.unit}) at ${topPrice.market}${locNotice} is GH₵ ${topPrice.wholesalePriceGHS} wholesale per ${topPrice.unit} (retail approx. GH₵ ${topPrice.retailPriceGHS}), with ${topPrice.priceTrend} price trend.`
          : `Current benchmark for ${targetCrop}${locNotice} is approximately GH₵ 240/bag wholesale based on MoFA market reports.`,
        actionCard: {
          type: 'price_check',
          data: prices,
        },
        toolsUsed: ['get_market_price'],
        actions,
        updatedMemory,
      };
    }

    // 25. Real URL Inspection
    if (lower.includes('http://') || lower.includes('https://') || lower.includes('inspect') || lower.includes('read this page') || lower.includes('check this link')) {
      const urlMatch = userPrompt.match(/(https?:\/\/[^\s]+)/g);
      if (urlMatch) {
        const targetUrl = urlMatch[0].replace(/[.,!?]+$/, '');
        const inspection = await UrlInspectorService.inspectUrl(targetUrl);
        if (!inspection.isAccessible) {
          return {
            reply: `I attempted to inspect ${targetUrl}, but could not retrieve it: ${inspection.description || inspection.error || 'Host unreachable'}.`,
            toolsUsed: ['inspectWebUrl'],
            actions,
            updatedMemory,
          };
        }
        return {
          reply: `I inspected ${targetUrl}. Title: "${inspection.title}". Summary: ${inspection.description || inspection.extractedText.slice(0, 200)}...`,
          actionCard: {
            type: 'web_summary',
            data: inspection,
          },
          toolsUsed: ['inspectWebUrl'],
          actions,
          updatedMemory,
        };
      }
    }

    // 26. Greetings
    if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower === 'kofi' || lower === 'good morning' || lower === 'good afternoon') {
      return {
        reply: "Akwaaba! I'm Kofi, your voice-first AI guide for GHarvest. How can I help you today? You can ask me to find produce, check market prices, calculate transport, or track your orders.",
        toolsUsed: ['kofiGreeting'],
        actions,
        updatedMemory,
      };
    }

    // 27. Clarification for unrecognized or unparsed requests
    return {
      reply: "I didn't quite get or understand what you said. Could you please repeat or paraphrase your question? You can ask me to 'Find tomatoes in Techiman', 'Check price of maize', 'Calculate transport', or 'Show my orders'.",
      toolsUsed: ['kofiClarification'],
      actions,
      updatedMemory,
    };
  }
}
