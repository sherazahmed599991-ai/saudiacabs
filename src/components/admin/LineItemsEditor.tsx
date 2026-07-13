"use client";

export type LineItemRow = { description: string; quantity: string; unitPrice: string };

const inputClass = "rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary";

export default function LineItemsEditor({ rows, onChange }: { rows: LineItemRow[]; onChange: (rows: LineItemRow[]) => void }) {
  const total = rows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.unitPrice) || 0), 0);

  function updateRow(i: number, field: keyof LineItemRow, value: string) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    onChange([...rows, { description: "", quantity: "1", unitPrice: "" }]);
  }

  function removeRow(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">Line Items</label>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              placeholder="Description"
              value={row.description}
              onChange={(e) => updateRow(i, "description", e.target.value)}
              className={`flex-1 ${inputClass}`}
            />
            <input
              type="number"
              min="1"
              placeholder="Qty"
              value={row.quantity}
              onChange={(e) => updateRow(i, "quantity", e.target.value)}
              className={`w-20 ${inputClass}`}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Unit Price"
              value={row.unitPrice}
              onChange={(e) => updateRow(i, "unitPrice", e.target.value)}
              className={`w-28 ${inputClass}`}
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={rows.length === 1}
              className="text-sm text-muted disabled:opacity-30"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addRow} className="mt-2 text-sm font-medium text-primary">
        + Add line item
      </button>
      <div className="mt-3 flex justify-end text-lg font-bold text-foreground">Total: SAR {total.toFixed(2)}</div>
    </div>
  );
}
