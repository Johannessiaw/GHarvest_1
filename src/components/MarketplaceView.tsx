import React, { useState } from 'react';
import { Sprout, CheckCircle2, MapPin, Phone, ShieldCheck, Tag, Mic, Plus } from 'lucide-react';
import { HarvestListing } from '../types';

interface MarketplaceViewProps {
  harvests: HarvestListing[];
  onOrderWithKofi: (harvest: HarvestListing) => void;
  onOpenNewListing: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  selectedListingId?: string | null;
  onSelectListing?: (harvest: HarvestListing) => void;
  locationFilter?: string;
  onLocationFilterChange?: (loc: string) => void;
  sortOption?: 'cheapest' | 'highest_price' | 'nearest' | 'newest';
  onSortOptionChange?: (sort: 'cheapest' | 'highest_price' | 'nearest' | 'newest') => void;
  onClearFilters?: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  harvests,
  onOrderWithKofi,
  onOpenNewListing,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  selectedListingId,
  onSelectListing,
  locationFilter,
  onLocationFilterChange,
  sortOption = 'cheapest',
  onSortOptionChange,
  onClearFilters,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [internalSearchQuery, setInternalSearchQuery] = useState<string>('');

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = (val: string) => {
    setInternalSearchQuery(val);
    onSearchQueryChange?.(val);
  };

  const filteredHarvests = harvests.filter((h) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Vegetables' && ['Tomatoes', 'Pepper', 'Onions', 'Garden Eggs'].includes(h.crop)) ||
      (selectedCategory === 'Cereals' && ['Maize', 'Rice', 'Soybeans'].includes(h.crop)) ||
      (selectedCategory === 'Roots & Tubers' && ['Yam', 'Cassava', 'Plantain'].includes(h.crop)) ||
      (selectedCategory === 'Fruits' && ['Pineapple', 'Mango', 'Watermelon'].includes(h.crop));

    const matchesSearch =
      h.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.locationTown.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.variety.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      !locationFilter || h.locationTown.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesCategory && matchesSearch && matchesLocation;
  });

  // Apply sorting
  if (sortOption === 'cheapest') {
    filteredHarvests.sort((a, b) => a.unitPriceGHS - b.unitPriceGHS);
  } else if (sortOption === 'highest_price') {
    filteredHarvests.sort((a, b) => b.unitPriceGHS - a.unitPriceGHS);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-400" />
            Verified Smallholder Harvests
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Directly sourced from MoFA-verified Ghanaian smallholder farmers with escrow protection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewListing}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            List Harvest (Farmer Mode)
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-[#0e1d14] p-2.5 rounded-xl border border-emerald-950">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          {['All', 'Vegetables', 'Cereals', 'Roots & Tubers', 'Fruits'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-emerald-900/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search crop, town (e.g. Techiman), farmer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14261b] text-gray-200 border border-emerald-900/70 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(locationFilter || searchQuery || sortOption) && (
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          <span className="text-[11px] text-gray-400">Active filters:</span>
          {searchQuery && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] flex items-center gap-1">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-white ml-0.5">×</button>
            </span>
          )}
          {locationFilter && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] flex items-center gap-1">
              Location: {locationFilter}
              <button onClick={() => onLocationFilterChange?.('')} className="hover:text-white ml-0.5">×</button>
            </span>
          )}
          {sortOption && (
            <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[11px]">
              Sort: {sortOption === 'cheapest' ? 'Lowest Price First' : sortOption}
            </span>
          )}
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="text-[11px] text-gray-400 hover:text-white underline ml-2"
            >
              Reset all filters
            </button>
          )}
        </div>
      )}

      {/* Harvest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHarvests.map((harvest) => {
          const isSelected = selectedListingId === harvest.id;
          return (
            <div
              key={harvest.id}
              onClick={() => onSelectListing?.(harvest)}
              className={`bg-[#101f16] rounded-2xl border overflow-hidden shadow-lg flex flex-col transition duration-200 cursor-pointer ${
                isSelected
                  ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-cyan-900/30'
                  : 'border-emerald-900/60 hover:border-emerald-600/60'
              }`}
            >
            {/* Image & Badges */}
            <div className="relative h-44 w-full bg-emerald-950 overflow-hidden">
              <img
                src={harvest.imageUrl}
                alt={harvest.crop}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute top-3 left-3 bg-[#0b1610]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-400" />
                {harvest.crop} ({harvest.localName})
              </div>

              <div className="absolute top-3 right-3 bg-emerald-900/90 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-600/50 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Verified MoFA
              </div>

              <div className="absolute bottom-3 left-3 bg-[#0a140e]/90 px-3 py-1 rounded-lg text-xs text-white font-bold border border-emerald-800/60">
                GH₵ {harvest.unitPriceGHS} <span className="text-[10px] font-normal text-gray-300">/ {harvest.unit}</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {harvest.locationTown}, {harvest.locationRegion}
                  </span>
                  <span className="text-gray-400 text-[11px] font-mono">
                    Stock: {harvest.quantityAvailable} {harvest.unit}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-white mt-1">
                  {harvest.variety}
                </h3>

                <p className="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed">
                  {harvest.notes}
                </p>

                {/* Farmer Info */}
                <div className="mt-3.5 pt-3 border-t border-emerald-950 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Farmer</span>
                    <span className="font-semibold text-gray-200">{harvest.farmerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Phone</span>
                    <span className="text-emerald-400 font-mono text-[11px]">{harvest.farmerPhone}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-2">
                <button
                  onClick={() => onOrderWithKofi(harvest)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-98"
                >
                  <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
                  Order with Kofi Voice
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};
