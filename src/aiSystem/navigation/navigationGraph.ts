/**
 * Ɔkwankyerɛfo Pa — Navigation Graph & State Definitions
 */

export interface NavigationNode {
  id: string;
  name: string;
  allowedTransitions: string[];
  screenRoute: string; // maps to GHarvest / AppRoute ('home' | 'marketplace' | 'orders' | 'logistics' | 'farmer_services')
  step?: string;
  requiresAuth?: boolean;
}

export const NAVIGATION_GRAPH: Record<string, NavigationNode> = {
  HOME: {
    id: 'HOME',
    name: 'Home Overview',
    screenRoute: 'home',
    allowedTransitions: ['MOBILE_MONEY', 'MARKETPLACE', 'ORDERS', 'LOGISTICS', 'HELP'],
  },
  MOBILE_MONEY: {
    id: 'MOBILE_MONEY',
    name: 'Mobile Money Hub',
    screenRoute: 'orders',
    allowedTransitions: ['HOME', 'SEND_MONEY', 'BUY_AIRTIME', 'CHECK_BALANCE', 'PAY_BILL', 'CASH_OUT'],
  },
  SEND_MONEY: {
    id: 'SEND_MONEY',
    name: 'Send Money',
    screenRoute: 'orders',
    step: 'network',
    allowedTransitions: ['MOBILE_MONEY', 'HOME', 'NETWORK'],
  },
  NETWORK: {
    id: 'NETWORK',
    name: 'Select Telecom Network',
    screenRoute: 'orders',
    step: 'network',
    allowedTransitions: ['RECIPIENT', 'SEND_MONEY', 'HOME'],
  },
  RECIPIENT: {
    id: 'RECIPIENT',
    name: 'Recipient Information',
    screenRoute: 'orders',
    step: 'recipient',
    allowedTransitions: ['AMOUNT', 'NETWORK', 'HOME'],
  },
  AMOUNT: {
    id: 'AMOUNT',
    name: 'Transaction Amount',
    screenRoute: 'orders',
    step: 'amount',
    allowedTransitions: ['CONFIRMATION', 'RECIPIENT', 'HOME'],
  },
  CONFIRMATION: {
    id: 'CONFIRMATION',
    name: 'Transaction Confirmation',
    screenRoute: 'orders',
    step: 'review',
    allowedTransitions: ['SECURE_AUTHENTICATION', 'HOME', 'AMOUNT'],
  },
  SECURE_AUTHENTICATION: {
    id: 'SECURE_AUTHENTICATION',
    name: 'Secure PIN Keypad (External Controlled Execution)',
    screenRoute: 'orders',
    step: 'authentication',
    requiresAuth: true,
    allowedTransitions: ['TRANSACTION_RESULT', 'HOME'],
  },
  TRANSACTION_RESULT: {
    id: 'TRANSACTION_RESULT',
    name: 'Transaction Completed / Failed',
    screenRoute: 'orders',
    step: 'completed',
    allowedTransitions: ['HOME', 'MOBILE_MONEY', 'ORDERS'],
  },
  MARKETPLACE: {
    id: 'MARKETPLACE',
    name: 'Produce Marketplace',
    screenRoute: 'marketplace',
    allowedTransitions: ['HOME', 'LOGISTICS', 'ORDERS'],
  },
  ORDERS: {
    id: 'ORDERS',
    name: 'Orders & Escrow Tracking',
    screenRoute: 'orders',
    allowedTransitions: ['HOME', 'LOGISTICS', 'MARKETPLACE'],
  },
  LOGISTICS: {
    id: 'LOGISTICS',
    name: 'Logistics & Haulage Rates',
    screenRoute: 'logistics',
    allowedTransitions: ['HOME', 'ORDERS', 'MARKETPLACE'],
  },
};
