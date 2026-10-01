/**
 * Payment Provider Abstraction for GHarvest Escrow
 * Enforces strict separation between DEMO simulation and REAL production gateways (e.g. Paystack / Hubtel / Mobile Money API).
 */

export interface PaymentInitiationRequest {
  orderId: string;
  amountGHS: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: 'MTN Mobile Money' | 'Telecel Cash' | 'AT Money' | 'Card' | 'Bank Transfer';
  callbackUrl?: string;
}

export interface PaymentInitiationResult {
  isDemo: boolean;
  status: 'demo_simulated' | 'pending_user_authorization' | 'failed';
  transactionReference: string;
  provider: string;
  authorizationUrl?: string;
  instructions: string;
  warningNotice: string;
}

export interface PaymentVerificationResult {
  isDemo: boolean;
  status: 'verified_held_in_escrow' | 'failed' | 'simulated_success';
  transactionReference: string;
  amountGHS: number;
  verifiedAt: string;
  gatewayResponse: string;
}

export interface PaymentGatewayProvider {
  getProviderName(): string;
  isLiveGateway(): boolean;
  initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult>;
  verifyPayment(transactionReference: string): Promise<PaymentVerificationResult>;
}

/**
 * Demo Sandbox Provider
 * Transparently informs users and systems that no real financial transaction is occurring.
 */
export class DemoSandboxPaymentProvider implements PaymentGatewayProvider {
  public getProviderName(): string {
    return 'GHarvest Demo Sandbox (NOT CONNECTED TO LIVE TELECOM GATEWAY)';
  }

  public isLiveGateway(): boolean {
    return false;
  }

  public async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    const transactionReference = `DEMO-TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      isDemo: true,
      status: 'demo_simulated',
      transactionReference,
      provider: this.getProviderName(),
      instructions: `This is a sandbox simulation for demonstration purposes. No money has been deducted from ${request.customerPhone} via ${request.paymentMethod}.`,
      warningNotice: 'DEMO MODE: Real payment provider credentials are not yet configured.',
    };
  }

  public async verifyPayment(transactionReference: string): Promise<PaymentVerificationResult> {
    return {
      isDemo: true,
      status: 'simulated_success',
      transactionReference,
      amountGHS: 0,
      verifiedAt: new Date().toISOString(),
      gatewayResponse: 'SIMULATED DEMO: Order draft recorded without real monetary settlement.',
    };
  }
}

// Active provider instance (defaults to Demo Sandbox until merchant credentials are provided)
export const activePaymentProvider: PaymentGatewayProvider = new DemoSandboxPaymentProvider();
