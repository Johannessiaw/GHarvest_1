/**
 * Mobile Money Escrow Service for GHarvest
 * Manages the escrow lifecycle protecting smallholders and agricultural buyers
 */

import { dbStore, OrderRecord } from '../db/store';
import { LogisticsService } from './logisticsService';
import { activePaymentProvider } from './paymentProvider';

export interface CreateOrderParams {
  crop: string;
  quantity: number;
  unit: string;
  pickupTown: string;
  deliveryTown: string;
  buyerName?: string;
  buyerPhone?: string;
  farmerName?: string;
  farmerPhone?: string;
  paymentMethod?: OrderRecord['paymentMethod'];
}

export class EscrowService {
  public static calculateQuotation(crop: string, quantity: number, pickupTown: string, deliveryTown: string) {
    const prices = dbStore.getMarketPrices({ crop });
    const unitPrice = prices.length > 0 ? prices[0].wholesalePriceGHS : 100;
    const cropTotal = quantity * unitPrice;

    const freight = LogisticsService.calculateFreight(pickupTown, deliveryTown, quantity, crop);
    const serviceFeeGHS = Math.max(30, Math.round(cropTotal * 0.025));
    const totalAmountGHS = cropTotal + freight.estimatedCostGHS + serviceFeeGHS;

    return { crop, quantity, unitPriceGHS: unitPrice, cropTotalGHS: cropTotal, freight, serviceFeeGHS, totalAmountGHS };
  }

  /**
   * Create an order: quote it, run it through the payment provider, then persist
   * with a status that reflects whether payment actually succeeded.
   */
  public static async createOrder(params: CreateOrderParams): Promise<OrderRecord> {
    const quote = this.calculateQuotation(params.crop, params.quantity, params.pickupTown, params.deliveryTown);

    let farmerName = params.farmerName;
    let farmerPhone = params.farmerPhone;
    if (!farmerName) {
      const farmers = dbStore.getFarmers(params.crop);
      if (farmers.length > 0) {
        farmerName = farmers[0].name;
        farmerPhone = farmers[0].phone;
      } else {
        farmerName = 'MoFA Verified Farmer';
        farmerPhone = '024 456 7891';
      }
    }

    const buyerName = params.buyerName || 'GHarvest Verified Buyer';
    const buyerPhone = params.buyerPhone || '024 333 4455';
    const paymentMethod = params.paymentMethod || 'MTN Mobile Money';

    // Draft reference used only to correlate the payment attempt with this quote.
    const draftReference = `DRAFT-${Date.now()}`;

    const initiation = await activePaymentProvider.initiatePayment({
      orderId: draftReference,
      amountGHS: quote.totalAmountGHS,
      customerName: buyerName,
      customerPhone: buyerPhone,
      paymentMethod,
    });

    const verification = await activePaymentProvider.verifyPayment(initiation.transactionReference);
    const paymentSucceeded =
      verification.status === 'verified_held_in_escrow' || verification.status === 'simulated_success';

    return dbStore.createOrder({
      crop: params.crop,
      quantity: params.quantity,
      unit: params.unit,
      totalCropPriceGHS: quote.cropTotalGHS,
      transportPriceGHS: quote.freight.estimatedCostGHS,
      serviceFeeGHS: quote.serviceFeeGHS,
      totalAmountGHS: quote.totalAmountGHS,
      buyerName,
      buyerPhone,
      farmerName,
      farmerPhone,
      pickupTown: quote.freight.origin,
      deliveryTown: quote.freight.destination,
      vehicle: quote.freight.vehicle,
      paymentMethod,
      status: paymentSucceeded ? 'escrow_funded' : 'pending_confirmation',
      escrowStatus: paymentSucceeded ? 'held' : undefined,
      isDemo: initiation.isDemo,
      paymentNotice: initiation.isDemo ? initiation.instructions : verification.gatewayResponse,
    });
  }

  public static getOrders(): OrderRecord[] {
    return dbStore.getOrders();
  }

  public static updateStatus(
    orderId: string,
    status: OrderRecord['status'],
    escrowStatus?: OrderRecord['escrowStatus'],
    note?: string
  ): OrderRecord | null {
    return dbStore.updateOrderStatus(orderId, status, escrowStatus, note);
  }
}
