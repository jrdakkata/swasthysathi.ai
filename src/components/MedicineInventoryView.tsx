import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  PackageOpen, 
  FileText, 
  Eye, 
  X, 
  Calendar, 
  RefreshCw, 
  TrendingDown, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MedicineItem, MedicineStatus, calculateStockStatus } from '../types/health';

interface MedicineInventoryViewProps {
  medicines: MedicineItem[];
  onUpdateStock: (medicineId: string, newStock: number) => void;
  onAddMedicine: (item: MedicineItem) => void;
}

export const MedicineInventoryView: React.FC<MedicineInventoryViewProps> = ({
  medicines,
  onUpdateStock,
  onAddMedicine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | MedicineStatus>('All');
  const [selectedMedDetail, setSelectedMedDetail] = useState<MedicineItem | null>(null);
  const [showIndentModal, setShowIndentModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New medicine form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Maternal & Child');
  const [newStock, setNewStock] = useState(60);
  const [newThreshold, setNewThreshold] = useState(40);
  const [newUnit, setNewUnit] = useState('Strips (10 tabs)');
  const [newSupplier, setNewSupplier] = useState('Block PHC Central Depot');

  // Quick edit custom quantity state inside modal
  const [customQuantity, setCustomQuantity] = useState<number | ''>('');

  const categories = [
    'All',
    'Maternal & Child',
    'Essential Antibiotics',
    'General Relief',
    'NCD Supplies',
    'Emergency & First Aid'
  ];

  // Critical and Low Stock calculations
  const criticalList = medicines.filter((m) => m.status === 'Critical');
  const lowStockList = medicines.filter((m) => m.status === 'Low Stock');
  const availableList = medicines.filter((m) => m.status === 'Available');

  // Filtering
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.batchNo && med.batchNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      med.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || med.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || med.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAdjust = (id: string, current: number, delta: number, medName: string) => {
    const updated = Math.max(0, current + delta);
    onUpdateStock(id, updated);
    
    // Provide quick feedback
    const med = medicines.find(m => m.id === id);
    const newStatus = med ? calculateStockStatus(updated, med.minThreshold) : 'Available';
    setNotification(`Updated ${medName}: ${updated} ${med?.unit || ''} (Status: ${newStatus})`);
    setTimeout(() => setNotification(null), 3000);

    // If modal open, update selected med
    if (selectedMedDetail && selectedMedDetail.id === id) {
      setSelectedMedDetail({
        ...selectedMedDetail,
        currentStock: updated,
        status: newStatus,
        lastUpdated: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleSetCustomQuantity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedDetail || customQuantity === '') return;
    const updated = Math.max(0, Number(customQuantity));
    onUpdateStock(selectedMedDetail.id, updated);
    const newStatus = calculateStockStatus(updated, selectedMedDetail.minThreshold);
    setNotification(`Updated stock for ${selectedMedDetail.name} to ${updated} ${selectedMedDetail.unit}`);
    setTimeout(() => setNotification(null), 3000);

    setSelectedMedDetail({
      ...selectedMedDetail,
      currentStock: updated,
      status: newStatus,
      lastUpdated: new Date().toISOString().split('T')[0],
    });
    setCustomQuantity('');
  };

  const handleAddNewMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const validStock = Math.max(0, Number(newStock) || 0);
    const validThreshold = Math.max(1, Number(newThreshold) || 10);
    const autoStatus = calculateStockStatus(validStock, validThreshold);

    const item: MedicineItem = {
      id: `MED-${Math.floor(300 + Math.random() * 700)}`,
      name: newName.trim(),
      category: newCategory,
      currentStock: validStock,
      minThreshold: validThreshold,
      unit: newUnit,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: autoStatus,
      batchNo: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: '2028-06-30',
      supplier: newSupplier,
      notes: 'Added to sub-centre drug inventory register',
    };

    onAddMedicine(item);
    setShowAddModal(false);
    setNewName('');
    setNotification(`Added new medicine: ${item.name} with auto status: ${autoStatus}`);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Medicine & Essential Drug Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Sub-centre drug kit monitoring, automatic stock-status calculations, and indenting
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowIndentModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Drug Indent Form ({criticalList.length + lowStockList.length})</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* User Feedback Notification */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900 font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Critical Stock Alert Banner */}
      {criticalList.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <span>Critical Stock Warning: {criticalList.length} Medicine(s) Depleted Below Threshold</span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5">
                Supplies for {criticalList.map(m => m.name).slice(0, 3).join(', ')} are critically low. Submit Indent Form D-2 immediately to the Block PHC store to prevent stock-outs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setStatusFilter('Critical');
                setCategoryFilter('All');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors whitespace-nowrap shadow-xs"
            >
              Filter Critical ({criticalList.length})
            </button>
            <button
              onClick={() => setShowIndentModal(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 transition-colors whitespace-nowrap"
            >
              Open Reorder
            </button>
          </div>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('Critical')}
          className="bg-white border border-rose-200/80 rounded-xl p-4 text-left hover:border-rose-300 transition-colors shadow-xs"
        >
          <div className="text-xs font-semibold text-rose-600 flex items-center justify-between">
            <span>Critical Shortages</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-700 mt-1 tabular-nums">
            {criticalList.length}
          </div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">Below minimum reserve</div>
        </button>

        <button
          onClick={() => setStatusFilter('Low Stock')}
          className="bg-white border border-amber-200/80 rounded-xl p-4 text-left hover:border-amber-300 transition-colors shadow-xs"
        >
          <div className="text-xs font-semibold text-amber-700 flex items-center justify-between">
            <span>Low Stock</span>
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-800 mt-1 tabular-nums">
            {lowStockList.length}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-0.5">Near safety threshold</div>
        </button>

        <button
          onClick={() => setStatusFilter('Available')}
          className="bg-white border border-emerald-200/80 rounded-xl p-4 text-left hover:border-emerald-300 transition-colors shadow-xs"
        >
          <div className="text-xs font-semibold text-emerald-700 flex items-center justify-between">
            <span>Available</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-800 mt-1 tabular-nums">
            {availableList.length}
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-0.5">Above safety threshold</div>
        </button>

        <button
          onClick={() => setStatusFilter('All')}
          className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-slate-300 transition-colors shadow-xs"
        >
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Total Catalog</span>
            <PackageOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1 tabular-nums">
            {medicines.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Registered drug items</div>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by drug name (e.g. IFA, ORS, Amoxicillin), batch, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category */}
          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Drug Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs font-medium text-slate-400 mr-2">Filter by Status:</span>
            {(['All', 'Available', 'Low Stock', 'Critical'] as const).map((status) => {
              const isActive = statusFilter === status;
              const count =
                status === 'All'
                  ? medicines.length
                  : medicines.filter((m) => m.status === status).length;

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : status === 'Critical' && count > 0
                        ? 'bg-rose-100 text-rose-700'
                        : status === 'Low Stock' && count > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 tabular-nums">
            Showing <strong>{filteredMedicines.length}</strong> of <strong>{medicines.length}</strong> items
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Item ID</th>
                <th className="py-3 px-4">Medicine Name & Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Min. Threshold</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Quick Stock Adjust</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-slate-500">
                    No medicine items match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const isCritical = med.status === 'Critical';
                  const isLow = med.status === 'Low Stock';
                  const isAvailable = med.status === 'Available';
                  const stockPct = Math.min(100, Math.round((med.currentStock / (med.minThreshold * 1.5)) * 100));

                  return (
                    <tr
                      key={med.id}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        isCritical ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Item ID */}
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                        {med.id}
                      </td>

                      {/* Name & Category */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedMedDetail(med)}
                          className="font-semibold text-slate-900 hover:text-emerald-700 hover:underline text-left block"
                        >
                          {med.name}
                        </button>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>{med.category}</span>
                          {med.batchNo && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-[11px] text-slate-400">Batch {med.batchNo}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-4 tabular-nums">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-base ${
                              isCritical
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-700'
                                : 'text-slate-900'
                            }`}
                          >
                            {med.currentStock}
                          </span>
                        </div>
                        {/* Mini visual indicator bar */}
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isCritical
                                ? 'bg-rose-500'
                                : isLow
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${stockPct}%` }}
                          />
                        </div>
                      </td>

                      {/* Minimum Threshold */}
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600 tabular-nums">
                        {med.minThreshold}
                      </td>

                      {/* Unit */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {med.unit}
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 tabular-nums">
                        {med.lastUpdated}
                      </td>

                      {/* Stock Status (Auto Calculated) */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded inline-flex items-center gap-1 ${
                            isCritical
                              ? 'text-rose-700 bg-rose-100 border border-rose-200'
                              : isLow
                              ? 'text-amber-800 bg-amber-100 border border-amber-200'
                              : 'text-emerald-800 bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {isCritical && <AlertTriangle className="w-3 h-3" />}
                          <span>{med.status}</span>
                        </span>
                      </td>

                      {/* Quick Stock Adjust Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleAdjust(med.id, med.currentStock, -5, med.name)}
                            disabled={med.currentStock <= 0}
                            title="Decrease by 5"
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-30"
                          >
                            <span className="text-[11px] font-bold px-0.5">-5</span>
                          </button>
                          <button
                            onClick={() => handleAdjust(med.id, med.currentStock, -1, med.name)}
                            disabled={med.currentStock <= 0}
                            title="Decrease by 1"
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-30"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdjust(med.id, med.currentStock, 1, med.name)}
                            title="Increase by 1"
                            className="p-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdjust(med.id, med.currentStock, 10, med.name)}
                            title="Add batch of 10"
                            className="px-2 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      {/* Detail View Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedMedDetail(med)}
                          title="View Medicine Details"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Medicine Detail View Modal */}
      {selectedMedDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedMedDetail.name}
                  </h3>
                  <span className="font-mono text-xs text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                    {selectedMedDetail.id}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Category: {selectedMedDetail.category} · Unit: {selectedMedDetail.unit}
                </div>
              </div>
              <button
                onClick={() => setSelectedMedDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Critical Alert if status is Critical */}
              {selectedMedDetail.status === 'Critical' && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-900">
                    <strong className="font-semibold block">⚠️ Critical Stock Shortage Alert</strong>
                    <span>
                      Current stock ({selectedMedDetail.currentStock} {selectedMedDetail.unit}) is below the required safety threshold of {selectedMedDetail.minThreshold}. An indent order with Block PHC is urgently needed.
                    </span>
                  </div>
                </div>
              )}

              {/* Status and Calculation Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Automatic Stock Status
                  </div>
                  <div className="mt-1">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded inline-flex items-center gap-1 ${
                        selectedMedDetail.status === 'Critical'
                          ? 'text-rose-700 bg-rose-100 border border-rose-200'
                          : selectedMedDetail.status === 'Low Stock'
                          ? 'text-amber-800 bg-amber-100 border border-amber-200'
                          : 'text-emerald-800 bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {selectedMedDetail.status === 'Critical' && <AlertTriangle className="w-3 h-3" />}
                      <span>{selectedMedDetail.status}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Last Inventory Update
                  </div>
                  <div className="text-sm font-semibold text-slate-900 mt-1 tabular-nums">
                    {selectedMedDetail.lastUpdated}
                  </div>
                </div>
              </div>

              {/* Stock Numbers & Threshold */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-500 font-medium">Current Stock on Hand</div>
                  <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                    {selectedMedDetail.currentStock} <span className="text-xs font-normal text-slate-500">{selectedMedDetail.unit}</span>
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-500 font-medium">Minimum Safety Threshold</div>
                  <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                    {selectedMedDetail.minThreshold} <span className="text-xs font-normal text-slate-500">{selectedMedDetail.unit}</span>
                  </div>
                </div>
              </div>

              {/* Quick Update Stock Section inside Modal */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="text-xs font-bold text-slate-900">
                  Update Stock Quantity
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdjust(selectedMedDetail.id, selectedMedDetail.currentStock, -10, selectedMedDetail.name)}
                    disabled={selectedMedDetail.currentStock < 10}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded disabled:opacity-30"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjust(selectedMedDetail.id, selectedMedDetail.currentStock, -1, selectedMedDetail.name)}
                    disabled={selectedMedDetail.currentStock <= 0}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded disabled:opacity-30"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjust(selectedMedDetail.id, selectedMedDetail.currentStock, 1, selectedMedDetail.name)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjust(selectedMedDetail.id, selectedMedDetail.currentStock, 10, selectedMedDetail.name)}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjust(selectedMedDetail.id, selectedMedDetail.currentStock, 50, selectedMedDetail.name)}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded"
                  >
                    +50 (Restock Batch)
                  </button>
                </div>

                {/* Custom quantity form */}
                <form onSubmit={handleSetCustomQuantity} className="flex items-center gap-2 pt-1 border-t border-slate-200">
                  <input
                    type="number"
                    min="0"
                    placeholder="Set custom stock..."
                    value={customQuantity}
                    onChange={(e) => setCustomQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-36 px-2.5 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={customQuantity === ''}
                    className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded disabled:opacity-40"
                  >
                    Apply Stock
                  </button>
                </form>
              </div>

              {/* Batch & Supplier Metadata */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Batch Number:</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedMedDetail.batchNo || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Expiration Date:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{selectedMedDetail.expiryDate || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Source / Supplier:</span>
                  <span className="font-semibold text-slate-900">{selectedMedDetail.supplier || 'District Health Depot'}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedMedDetail.notes && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    Inventory Remarks
                  </h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                    {selectedMedDetail.notes}
                  </div>
                </div>
              )}

              {/* Safety Notice */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Administrative inventory tracking only. Medicines cannot be prescribed or dispensed without medical authorization.</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedMedDetail(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedMedDetail(null);
                  setShowIndentModal(true);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                Add to Indent Requisition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drug Indent Requisition Modal */}
      {showIndentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Form D-2: Sub-Centre Drug Indent Requisition
                </h3>
                <p className="text-xs text-slate-500">
                  Official reorder requisition to Block PHC Central Medical Store
                </p>
              </div>
              <button
                onClick={() => setShowIndentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-emerald-950">
                <strong>Sub-Centre:</strong> Rampur Sub-Centre · <strong>Date:</strong> 2026-09-30 · <strong>Authorized ANM:</strong> Sister Sunita Devi
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Medicines Requiring Indent Reorder ({criticalList.length + lowStockList.length} Items)
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {[...criticalList, ...lowStockList].map((med) => {
                    const recommendedOrder = Math.max(20, (med.minThreshold * 2) - med.currentStock);
                    return (
                      <div key={med.id} className="p-3 flex items-center justify-between text-xs bg-white">
                        <div>
                          <div className="font-semibold text-slate-900">{med.name}</div>
                          <div className="text-slate-500">
                            Current: <strong className="text-rose-600 tabular-nums">{med.currentStock}</strong> / Min: {med.minThreshold} {med.unit}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block">Recommended Order</span>
                          <span className="font-bold text-emerald-700 tabular-nums">+{recommendedOrder} {med.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed">
                Clicking "Submit Indent Requisition" prints this indent voucher for verification by the Primary Health Centre Pharmacist.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowIndentModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIndentModal(false);
                  setNotification('Official Indent Voucher D-2 successfully generated and sent to Block PHC store.');
                  setTimeout(() => setNotification(null), 4000);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Submit Indent Requisition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Register New Stock Item
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewMedicine} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medicine Name & Strength
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ciprofloxacin 500mg, IFA Syrup"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Drug Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Maternal & Child">Maternal & Child</option>
                  <option value="Essential Antibiotics">Essential Antibiotics</option>
                  <option value="General Relief">General Relief</option>
                  <option value="NCD Supplies">NCD Supplies</option>
                  <option value="Emergency & First Aid">Emergency & First Aid</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimum Safety Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Packaging Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier / Source
                  </label>
                  <input
                    type="text"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                💡 <strong>Auto-Calculated Status:</strong> Status will automatically calculate based on Current Stock vs Minimum Threshold ({calculateStockStatus(newStock, newThreshold)}).
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
