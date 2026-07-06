"use client";
import React, { useState, useMemo } from 'react';
import { PackageSearch, Download, Trash2, Edit2 } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';
import EditProductModal from '@/components/EditProductModal';
import { bulkDeleteProducts, deleteProduct } from '@/actions/inventory';
import * as XLSX from 'xlsx';

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  location: string;
  unit: string;
  price: number;
  purchasePrice: number;
  status: string;
  daysUntilEmpty: number;
}

interface InventoryClientProps {
  inventoryData: Product[];
  isOwner: boolean;
}

export default function InventoryClient({ inventoryData, isOwner }: InventoryClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(inventoryData.map(p => p.category));
    return ['All', ...Array.from(cats)].sort();
  }, [inventoryData]);

  const filteredData = useMemo(() => {
    return inventoryData.filter(item => {
      const matchCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchCategory && matchStatus;
    });
  }, [inventoryData, categoryFilter, statusFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredData.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) return;
    setIsDeleting(true);
    const result = await bulkDeleteProducts(Array.from(selectedIds));
    if (result.error) {
      alert(result.error);
    } else {
      setSelectedIds(new Set());
    }
    setIsDeleting(false);
  };

  const handleBulkExport = () => {
    const itemsToExport = filteredData.filter(p => selectedIds.has(p.id));
    const data = itemsToExport.map(p => ({
      "Item Code": p.code,
      "Item Name": p.name,
      "Category": p.category,
      "Stock": p.stock,
      "Unit": p.unit,
      "Location": p.location,
      "Purchase Price": p.purchasePrice,
      "Selling Price": p.price,
      "Status": p.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, `Inventory_Export.xlsx`);
  };

  const getStockColor = (stock: number) => {
    if (stock <= 0) return 'var(--danger)';
    if (stock <= 10) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
        >
          {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
        </select>
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
        >
          <option value="All">All Statuses</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        {selectedIds.size > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', background: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', color: 'white', alignItems: 'center', animation: 'fadeInUp 0.2s ease-out' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, marginRight: '8px' }}>{selectedIds.size} Selected</span>
            <button onClick={handleBulkExport} style={{ background: 'white', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Download size={14} /> Export
            </button>
            {isOwner && (
              <button onClick={handleBulkDelete} disabled={isDeleting} style={{ background: 'var(--danger)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trash2 size={14} /> {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                  onChange={handleSelectAll}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </th>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Location</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Est. Empty</th>
              <th>Status</th>
              {isOwner && <th className="desktop-only text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <PackageSearch size={48} color="var(--border)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>No Items Found</span>
                    <span style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your search or filters.</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.map((item) => (
              <tr key={item.id} style={{ background: selectedIds.has(item.id) ? 'var(--bg-main)' : 'transparent' }}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(item.id)}
                    onChange={() => handleSelect(item.id)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </td>
                <td className="text-primary font-medium">{item.code}</td>
                <td className="font-medium">{item.name}</td>
                <td>{item.category}</td>
                <td style={{ minWidth: '100px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.stock.toFixed(2)}</div>
                  <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (item.stock / (item.stock > 100 ? item.stock : 100)) * 100)}%`, height: '100%', background: getStockColor(item.stock) }} />
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '11px', background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    {item.location}
                  </span>
                </td>
                <td>{item.unit}</td>
                <td style={{ fontWeight: 500 }}>₹{item.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>
                  {item.daysUntilEmpty === -1 ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Insufficient Data</span>
                  ) : item.daysUntilEmpty <= 7 ? (
                    <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{item.daysUntilEmpty} Days ⚠️</span>
                  ) : (
                    <span style={{ color: 'var(--success)' }}>{item.daysUntilEmpty} Days</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${item.status.replace(/ /g, '-').toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                {isOwner && (
                  <td className="desktop-only">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button"
                        onClick={() => setEditingProduct(item)}
                        title="Edit Product"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <DeleteButton id={item.id} action={deleteProduct} itemType="product" />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {editingProduct && (
        <EditProductModal 
          product={editingProduct} 
          isOpen={true} 
          onClose={() => setEditingProduct(null)} 
        />
      )}
    </>
  );
}
