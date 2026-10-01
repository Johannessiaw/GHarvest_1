/**
 * Central Typed Application Action Registry for GHarvest
 * Strict allowlist of validated actions that Kofi can request
 */

import { AppRoute } from './index';

export type AllowedActionName =
  | 'navigate_to_screen'
  | 'search_marketplace'
  | 'filter_marketplace'
  | 'select_listing'
  | 'open_order_draft'
  | 'update_order_quantity'
  | 'show_orders'
  | 'show_order_details'
  | 'show_logistics'
  | 'track_order'
  | 'open_farmer_services'
  | 'open_home';

export interface NavigateToScreenAction {
  type: 'navigate_to_screen';
  payload: {
    screen: AppRoute;
    reason?: string;
  };
}

export interface SearchMarketplaceAction {
  type: 'search_marketplace';
  payload: {
    query: string;
  };
}

export interface FilterMarketplaceAction {
  type: 'filter_marketplace';
  payload: {
    location?: string;
    maxPrice?: number;
    crop?: string;
    sort?: 'cheapest' | 'highest_price' | 'nearest' | 'newest';
  };
}

export interface SelectListingAction {
  type: 'select_listing';
  payload: {
    listingId: string;
  };
}

export interface OpenOrderDraftAction {
  type: 'open_order_draft';
  payload: {
    crop: string;
    quantity: number;
    unit?: string;
    pickupTown?: string;
    deliveryTown?: string;
    farmerName?: string;
    farmerPhone?: string;
    unitPriceGHS?: number;
    estimatedTotalGHS?: number;
  };
}

export interface UpdateOrderQuantityAction {
  type: 'update_order_quantity';
  payload: {
    quantity: number;
  };
}

export interface ShowOrdersAction {
  type: 'show_orders';
  payload?: {
    statusFilter?: string;
  };
}

export interface ShowOrderDetailsAction {
  type: 'show_order_details';
  payload: {
    orderId: string;
  };
}

export interface ShowLogisticsAction {
  type: 'show_logistics';
  payload?: {
    origin?: string;
    destination?: string;
    quantity?: number;
    crop?: string;
  };
}

export interface TrackOrderAction {
  type: 'track_order';
  payload: {
    orderId: string;
  };
}

export interface OpenFarmerServicesAction {
  type: 'open_farmer_services';
  payload?: {
    action?: 'list_harvest' | 'view_coop';
  };
}

export interface OpenHomeAction {
  type: 'open_home';
  payload?: Record<string, never>;
}

export type AppAction =
  | NavigateToScreenAction
  | SearchMarketplaceAction
  | FilterMarketplaceAction
  | SelectListingAction
  | OpenOrderDraftAction
  | UpdateOrderQuantityAction
  | ShowOrdersAction
  | ShowOrderDetailsAction
  | ShowLogisticsAction
  | TrackOrderAction
  | OpenFarmerServicesAction
  | OpenHomeAction;

export const ALLOWED_ACTION_NAMES: readonly AllowedActionName[] = [
  'navigate_to_screen',
  'search_marketplace',
  'filter_marketplace',
  'select_listing',
  'open_order_draft',
  'update_order_quantity',
  'show_orders',
  'show_order_details',
  'show_logistics',
  'track_order',
  'open_farmer_services',
  'open_home',
] as const;

export const VALID_APP_ROUTES: readonly AppRoute[] = [
  'home',
  'marketplace',
  'orders',
  'logistics',
  'farmer_services',
  'nlp_studio',
] as const;

/**
 * Validate any untrusted action payload against our strict schema
 */
export function validateAppAction(action: any): { valid: boolean; action?: AppAction; error?: string } {
  if (!action || typeof action !== 'object' || typeof action.type !== 'string') {
    return { valid: false, error: 'Action must be an object with a string type property.' };
  }

  const type = action.type as AllowedActionName;
  if (!ALLOWED_ACTION_NAMES.includes(type)) {
    return { valid: false, error: `Action type '${type}' is not on the allowed actions registry.` };
  }

  const payload = action.payload || {};

  switch (type) {
    case 'navigate_to_screen': {
      if (!VALID_APP_ROUTES.includes(payload.screen)) {
        return { valid: false, error: `Invalid screen route: '${payload.screen}'. Must be one of: ${VALID_APP_ROUTES.join(', ')}` };
      }
      return { valid: true, action: { type, payload: { screen: payload.screen, reason: payload.reason } } };
    }

    case 'search_marketplace': {
      if (typeof payload.query !== 'string') {
        return { valid: false, error: 'search_marketplace requires string query.' };
      }
      return { valid: true, action: { type, payload: { query: payload.query.trim() } } };
    }

    case 'filter_marketplace': {
      return {
        valid: true,
        action: {
          type,
          payload: {
            location: typeof payload.location === 'string' ? payload.location.trim() : undefined,
            maxPrice: typeof payload.maxPrice === 'number' ? payload.maxPrice : undefined,
            crop: typeof payload.crop === 'string' ? payload.crop.trim() : undefined,
            sort: ['cheapest', 'highest_price', 'nearest', 'newest'].includes(payload.sort) ? payload.sort : undefined,
          },
        },
      };
    }

    case 'select_listing': {
      if (typeof payload.listingId !== 'string' || !payload.listingId.trim()) {
        return { valid: false, error: 'select_listing requires a non-empty listingId.' };
      }
      return { valid: true, action: { type, payload: { listingId: payload.listingId.trim() } } };
    }

    case 'open_order_draft': {
      if (!payload.crop || typeof payload.crop !== 'string') {
        return { valid: false, error: 'open_order_draft requires a valid crop name.' };
      }
      const qty = Number(payload.quantity);
      if (isNaN(qty) || qty <= 0) {
        return { valid: false, error: 'open_order_draft requires a positive quantity.' };
      }
      return {
        valid: true,
        action: {
          type,
          payload: {
            crop: payload.crop,
            quantity: qty,
            unit: payload.unit || 'Bags (100kg)',
            pickupTown: payload.pickupTown,
            deliveryTown: payload.deliveryTown,
            farmerName: payload.farmerName,
            farmerPhone: payload.farmerPhone,
            unitPriceGHS: payload.unitPriceGHS,
            estimatedTotalGHS: payload.estimatedTotalGHS,
          },
        },
      };
    }

    case 'update_order_quantity': {
      const qty = Number(payload.quantity);
      if (isNaN(qty) || qty <= 0) {
        return { valid: false, error: 'update_order_quantity requires a positive quantity number.' };
      }
      return { valid: true, action: { type, payload: { quantity: qty } } };
    }

    case 'show_orders': {
      return {
        valid: true,
        action: {
          type,
          payload: payload.statusFilter ? { statusFilter: String(payload.statusFilter) } : undefined,
        },
      };
    }

    case 'show_order_details': {
      if (!payload.orderId || typeof payload.orderId !== 'string') {
        return { valid: false, error: 'show_order_details requires a string orderId.' };
      }
      return { valid: true, action: { type, payload: { orderId: payload.orderId.trim() } } };
    }

    case 'show_logistics': {
      return {
        valid: true,
        action: {
          type,
          payload: {
            origin: payload.origin,
            destination: payload.destination,
            quantity: typeof payload.quantity === 'number' ? payload.quantity : undefined,
            crop: payload.crop,
          },
        },
      };
    }

    case 'track_order': {
      if (!payload.orderId || typeof payload.orderId !== 'string') {
        return { valid: false, error: 'track_order requires a string orderId.' };
      }
      return { valid: true, action: { type, payload: { orderId: payload.orderId.trim() } } };
    }

    case 'open_farmer_services': {
      return {
        valid: true,
        action: {
          type,
          payload: {
            action: payload.action === 'list_harvest' ? 'list_harvest' : 'view_coop',
          },
        },
      };
    }

    case 'open_home': {
      return { valid: true, action: { type, payload: {} } };
    }

    default:
      return { valid: false, error: `Unhandled action: ${type}` };
  }
}
