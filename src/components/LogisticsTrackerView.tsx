import React, { useState } from 'react';
import { Truck, MapPin, ShieldCheck, Clock, CheckCircle2, CloudRain, AlertCircle, Navigation, DollarSign } from 'lucide-react';
import { Order, LogisticsRoute, AgriculturalWeather } from '../types';
import { INITIAL_WEATHER_ADVISORIES, INITIAL_LOGISTICS_ROUTES, GHarvestDataManager } from '../services/gharvestData';

interface LogisticsTrackerViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status'], escrowStatus?: Order['escrowStatus'], note?: string) => void;
  selectedOrderId?: string | null;
  onSelectOrder?: (order: Order) => void;
}

export const LogisticsTrackerView: React.FC<LogisticsTrackerViewProps> = ({
  orders,
  onUpdateOrderStatus,
  selectedOrderId,
  onSelectOrder,
}) => {
  const [origin, setOrigin] = useState<string>('Techiman');
  const [destination, setDestination] = useState<string>('Kumasi');
  const [quantity, setQuantity] = useState<number>(50);

  const calculated = GHarvestDataManager.calculateTransport(origin, destination, quantity, 'Crates');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Weather Corridor Alert */}
      <div className="bg-[#102318] border border-emerald-800/60 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
          <CloudRain className="w-4 h-4 text-sky-400" />
          Agricultural Transit Weather Corridor (Ghana Met Agency Sync)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {INITIAL_WEATHER_ADVISORIES.map((w, i) => (
            <div key={i} className="bg-[#0b1810] p-3 rounded-xl border border-emerald-950">
              <div className="flex justify-between items-center font-bold text-white mb-1">
                <span>{w.town} ({w.region})</span>
                <span className="text-amber-400 font-mono">{w.temperatureC}°C</span>
              </div>
              <div className="text-gray-300 text-[11px] mb-1">{w.condition}</div>
              <p className="text-[10px] text-gray-400 leading-tight">{w.advisory}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Interactive Route Calculator & Active In-Transit Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Route Calculator */}
        <div className="lg:col-span-1 bg-[#0f1f16] p-5 rounded-2xl border border-emerald-900/60 shadow-lg h-fit">
          <h3 className="font-display font-bold text-lg text-white mb-1 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            Ghana Freight Calculator
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Instant estimate for smallholder crop hauling across Ghanaian road networks.
          </p>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-gray-300 mb-1 font-medium">Pickup Hub (Farmgate)</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Techiman">Techiman (Bono East Grain & Veg Hub)</option>
                <option value="Ejura">Ejura (Ashanti Maize Belt)</option>
                <option value="Tamale">Tamale (Northern Yam & Legume Hub)</option>
                <option value="Somanya">Somanya (Eastern Fruit Valley)</option>
                <option value="Kintampo">Kintampo (Cassava & Tubers)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-1 font-medium">Destination (Market / Processing Depot)</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Kumasi">Kumasi (Kejetia / Central Market)</option>
                <option value="Accra">Accra (Agbogbloshie / Makola / Tema)</option>
                <option value="Techiman">Techiman Central Market</option>
                <option value="Tamale">Tamale Central</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-1 font-medium">Quantity (Units / Bags / Crates)</label>
              <input
                type="number"
                min="1"
                max="5000"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Calculated Result Card */}
            <div className="mt-4 p-4 rounded-xl bg-[#0b160f] border border-emerald-800/60 text-xs space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Distance:</span>
                <span className="font-semibold text-white">{calculated.route.distanceKm} km</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Estimated Time:</span>
                <span className="font-semibold text-white">~{calculated.durationHours} hours</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Recommended Vehicle:</span>
                <span className="font-semibold text-amber-300">{calculated.vehicle}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Road Condition:</span>
                <span className="font-semibold text-emerald-400">{calculated.route.roadCondition}</span>
              </div>
              <div className="pt-2 border-t border-emerald-950 flex justify-between items-center text-sm font-bold text-emerald-300">
                <span>Estimated Rate:</span>
                <span className="font-mono text-base">GH₵ {calculated.estimatedCostGHS.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* In-Transit & Active Orders Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" />
              Active Orders & Escrow Tracking
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              {orders.length} Total Orders Tracked
            </span>
          </div>

          {orders.map((order) => {
            const isSelected = selectedOrderId === order.id;
            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder?.(order)}
                id={`order-${order.id}`}
                className={`bg-[#0f1f16] rounded-2xl border p-5 shadow-lg space-y-4 transition duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-cyan-900/30'
                    : 'border-emerald-900/60 hover:border-emerald-700/60'
                }`}
              >
              {/* Order Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-950 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">Order {order.id}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      order.status === 'completed'
                        ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/60'
                        : order.status === 'in_transit'
                        ? 'bg-sky-950 text-sky-300 border border-sky-800 animate-pulse'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {order.quantity} {order.unit} {order.crop} from {order.farmerName} ({order.pickupTown})
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-emerald-400 font-bold font-mono text-sm">
                    GH₵ {order.totalAmountGHS.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 sm:justify-end">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Escrow: {order.escrowStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className={`p-2 rounded-lg ${order.status !== 'pending_confirmation' ? 'bg-emerald-950/80 text-emerald-300 font-semibold' : 'bg-gray-800/40 text-gray-500'}`}>
                  1. Escrow Funded
                </div>
                <div className={`p-2 rounded-lg ${['transport_dispatched', 'in_transit', 'delivered', 'completed'].includes(order.status) ? 'bg-emerald-950/80 text-emerald-300 font-semibold' : 'bg-gray-800/40 text-gray-500'}`}>
                  2. Dispatched
                </div>
                <div className={`p-2 rounded-lg ${['in_transit', 'delivered', 'completed'].includes(order.status) ? 'bg-emerald-950/80 text-emerald-300 font-semibold' : 'bg-gray-800/40 text-gray-500'}`}>
                  3. In Transit
                </div>
                <div className={`p-2 rounded-lg ${['delivered', 'completed'].includes(order.status) ? 'bg-emerald-950/80 text-emerald-300 font-semibold' : 'bg-gray-800/40 text-gray-500'}`}>
                  4. Settled
                </div>
              </div>

              {/* Tracking Log */}
              <div className="bg-[#0b160f] p-3 rounded-xl border border-emerald-950 text-xs space-y-2">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                  Live Dispatch Log:
                </span>
                {order.trackingUpdates.map((t, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-white">{t.location}</span> ({t.timestamp}): {t.note}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action: Confirm delivery / release escrow */}
              {order.status !== 'completed' && (
                <div className="pt-2 flex justify-end gap-2">
                  {order.status === 'in_transit' && (
                    <button
                      onClick={() =>
                        onUpdateOrderStatus(
                          order.id,
                          'completed',
                          'released_to_farmer',
                          'Buyer verified shipment quality at offload. Escrow GH₵ released to farmer Kwabena Mensah.'
                        )
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Buyer Confirmed Delivery (Release Escrow to Farmer)
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
