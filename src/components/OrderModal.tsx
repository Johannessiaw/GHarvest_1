import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Phone, MapPin, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { Order } from '../types';

interface OrderModalProps {
  orderData: any;
  onClose: () => void;
  onFinalizeOrder: (order: Order) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  orderData,
  onClose,
  onFinalizeOrder,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'MTN Mobile Money' | 'Telecel Cash' | 'AT Money'>('MTN Mobile Money');
  const [buyerName, setBuyerName] = useState<string>('Kofi Mensah Catering');
  const [buyerPhone, setBuyerPhone] = useState<string>('024 123 4567');
  const [deliveryDate, setDeliveryDate] = useState<string>('2026-09-25');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConfirmAndPay = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    const payload = {
      crop: orderData.product || 'Tomatoes',
      quantity: orderData.quantity || 50,
      unit: orderData.unit || 'Crates',
      totalCropPriceGHS: orderData.cropPriceGHS || 4500,
      transportPriceGHS: orderData.transportGHS || 600,
      serviceFeeGHS: orderData.serviceFeeGHS || 120,
      totalAmountGHS: orderData.totalAmountGHS || 5220,
      buyerName,
      buyerPhone,
      farmerName: orderData.farmerName || 'Kwabena Mensah',
      farmerPhone: orderData.farmerPhone || '024 456 7891',
      pickupTown: orderData.pickup || 'Techiman',
      deliveryTown: orderData.destination || 'Kumasi',
      deliveryDate,
      paymentMethod,
    };

    try {
      // 1. Submit order draft to backend API
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const createdOrder: Order = await res.json();
      setCompletedOrder(createdOrder);
      setIsProcessing(false);
      setIsCompleted(true);

      setTimeout(() => {
        onFinalizeOrder(createdOrder);
      }, 1600);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(`Failed to register order: ${err.message || 'Server error'}. Please try again.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1f16] border border-emerald-800/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {isCompleted && completedOrder ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-display font-bold text-xl text-white">Demo Order Draft Created!</h3>
            <p className="text-xs text-amber-300 bg-amber-950/60 p-2.5 rounded-lg border border-amber-800/50 max-w-sm mx-auto">
              Notice: Sandbox Demonstration. Order <strong>{completedOrder.id}</strong> has been registered in the database, but no actual mobile money was deducted.
            </p>
            <p className="text-xs text-gray-300 max-w-sm mx-auto">
              Simulated notification sent for {orderData.quantity} {orderData.unit} of {orderData.product} to {orderData.destination}.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                CREATE ORDER DRAFT
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                Demo Sandbox
              </span>
            </div>
            <p className="text-xs text-amber-300/90 bg-amber-950/40 p-2 rounded-lg border border-amber-900/40 mb-3 text-[11px]">
              ⚠️ <strong>DEMO MODE:</strong> Real payment gateway credentials (MTN MoMo API / Paystack) are not yet connected. Submitting creates a simulated order draft. No real money will be charged.
            </p>

            {errorMsg && (
              <div className="p-2 mb-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Order specs */}
            <div className="bg-[#0b1710] p-4 rounded-xl border border-emerald-950 text-xs space-y-2 mb-4">
              <div className="flex justify-between font-semibold text-white">
                <span>Commodity:</span>
                <span>{orderData.quantity} {orderData.unit} {orderData.product}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Farmer (Demo Profile):</span>
                <span>{orderData.farmerName} ({orderData.pickup})</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Delivery Destination:</span>
                <span>{orderData.destination}</span>
              </div>
              <div className="pt-2 border-t border-emerald-950 flex justify-between text-emerald-300 font-bold text-sm">
                <span>Calculated Total:</span>
                <span>GH₵ {orderData.totalAmountGHS?.toLocaleString()}</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs mb-5">
              <div>
                <label className="block text-gray-300 mb-1">Buyer / Business Name</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Phone (MoMo Wallet)</label>
                  <input
                    type="text"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2 font-mono focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Delivery Target Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Mobile Money Payment Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['MTN Mobile Money', 'Telecel Cash', 'AT Money'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2 rounded-lg text-[11px] font-semibold transition border ${
                        paymentMethod === method
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-[#14261b] text-gray-300 border-emerald-900/60 hover:bg-emerald-950'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              disabled={isProcessing}
              onClick={handleConfirmAndPay}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering Order Draft with Backend...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  Submit Demo Order Draft (GH₵ {orderData.totalAmountGHS?.toLocaleString()})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
