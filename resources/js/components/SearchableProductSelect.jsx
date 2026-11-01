import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Check, Package, X, ChevronDown } from 'lucide-react';

export default function SearchableProductSelect({
  products = [],
  selectedProductId = '',
  productName = '',
  onSelect,
  onNameChange,
  placeholder = 'Search by product name, SKU or scan barcode...'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(productName || '');
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(productName || '');
  }, [productName]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId);
  }, [products, selectedProductId]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products.slice(0, 10);
    const q = query.toLowerCase();
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }).slice(0, 12);
  }, [products, query]);

  const handleSelectProduct = (prod) => {
    setQuery(prod.name);
    setIsOpen(false);
    if (onSelect) {
      onSelect(prod);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    if (onSelect) {
      onSelect(null);
    }
    if (onNameChange) {
      onNameChange('');
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Box */}
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (onNameChange) {
              onNameChange(e.target.value);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-8 pr-12 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-cyan-500 font-medium text-slate-900 dark:text-white"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-400 hover:text-slate-600"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Search Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredProducts.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500">
              No matching products found.
              <span className="block text-[10px] text-cyan-600 font-semibold mt-0.5">
                "{query}" will be added as a custom product.
              </span>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isSelected = p.id === selectedProductId;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition ${
                    isSelected
                      ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-200 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="font-bold block truncate">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        SKU: {p.sku || p.barcode || 'N/A'} • {p.category || 'Retail'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 block font-mono">
                      Stock: {p.stock || 0} {p.unit || 'pcs'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                      Cost: ₹{p.purchasePrice || 0} | Sell: ₹{p.sellingPrice || 0}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
