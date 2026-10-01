import React, { useState } from 'react';
import { X, Sprout, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { HarvestListing } from '../types';

interface FarmerListingModalProps {
  onClose: () => void;
  onAddHarvest: (harvest: HarvestListing) => void;
}

export const FarmerListingModal: React.FC<FarmerListingModalProps> = ({
  onClose,
  onAddHarvest,
}) => {
  const [crop, setCrop] = useState<string>('Tomatoes');
  const [variety, setVariety] = useState<string>('Roma / Petomech Grade A');
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<string>('Crates');
  const [unitPriceGHS, setUnitPriceGHS] = useState<number>(90);
  const [town, setTown] = useState<string>('Techiman');
  const [farmerName, setFarmerName] = useState<string>('Kwabena Mensah');
  const [farmerPhone, setFarmerPhone] = useState<string>('024 456 7891');
  const [notes, setNotes] = useState<string>('Freshly harvested from Techiman irrigated farmland. High firmness and sorted.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHarvest: HarvestListing = {
      id: `harvest-${Date.now()}`,
      farmerId: `farmer-${Date.now()}`,
      farmerName,
      farmerPhone,
      crop,
      localName: crop === 'Tomatoes' ? 'Nntosi' : crop === 'Maize' ? 'Aburo' : 'Bayere',
      variety,
      grade: 'Grade A (Export / Premium)',
      quantityAvailable: quantity,
      unit,
      unitPriceGHS,
      locationTown: town,
      locationRegion: 'Bono East',
      harvestDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
      minOrderQuantity: 5,
      inStock: true,
      notes,
    };
    onAddHarvest(newHarvest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1f16] border border-emerald-800/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
          <Sprout className="w-5 h-5" />
          LIST HARVEST (FARMER COMMERCE)
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Add your available crops to GHarvest. Kofi will match you with bulk buyers and caterers across Ghana.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 mb-1">Crop</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2"
              >
                <option value="Tomatoes">Tomatoes (Nntosi)</option>
                <option value="Maize">Maize (Aburo)</option>
                <option value="Yam">Yam (Bayere)</option>
                <option value="Pepper">Pepper (Mako)</option>
                <option value="Cassava">Cassava (Bankye)</option>
                <option value="Plantain">Plantain (Borode)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Town / Hub</label>
              <select
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2"
              >
                <option value="Techiman">Techiman (Bono East)</option>
                <option value="Ejura">Ejura (Ashanti)</option>
                <option value="Tamale">Tamale (Northern)</option>
                <option value="Somanya">Somanya (Eastern)</option>
                <option value="Kintampo">Kintampo (Bono East)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Variety & Description</label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-300 mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2"
              >
                <option value="Crates">Crates</option>
                <option value="Bags (100kg)">Bags (100kg)</option>
                <option value="100 Tubers">100 Tubers</option>
                <option value="Baskets">Baskets</option>
                <option value="Pieces">Pieces</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Unit Price (GH₵)</label>
              <input
                type="number"
                value={unitPriceGHS}
                onChange={(e) => setUnitPriceGHS(parseFloat(e.target.value) || 10)}
                className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 mb-1">Farmer Name</label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">MoMo Contact</label>
              <input
                type="text"
                value={farmerPhone}
                onChange={(e) => setFarmerPhone(e.target.value)}
                className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Harvest Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#162a1e] text-white border border-emerald-800/60 rounded-lg p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition mt-4"
          >
            Publish Harvest Listing to GHarvest
          </button>
        </form>
      </div>
    </div>
  );
};
