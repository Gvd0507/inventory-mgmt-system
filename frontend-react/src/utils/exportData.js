/**
 * CSV Export Utility
 * Converts JSON data to CSV format and triggers download
 */

/**
 * Convert JSON array to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional: Custom header names
 * @returns {string} CSV formatted string
 */
export function jsonToCSV(data, headers = null) {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const keys = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = keys.join(',');

  // Create data rows
  const dataRows = data.map((item) => {
    return keys
      .map((key) => {
        let value = item[key];

        // Handle different data types
        if (value === null || value === undefined) {
          return '';
        }

        // Format dates
        if (value instanceof Date || (typeof value === 'string' && key.toLowerCase().includes('date'))) {
          value = new Date(value).toLocaleString();
        }

        // Convert to string and escape
        value = String(value);

        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      })
      .join(',');
  });

  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file
 * @param {string} csv - CSV content
 * @param {string} filename - Name of the file (without extension)
 */
export function downloadCSV(csv, filename) {
  // Create blob with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

  // Create download link and trigger
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export items to CSV
 * @param {Array} items - Array of item objects
 */
export function exportItemsToCSV(items) {
  if (!items || items.length === 0) {
    alert('No items to export');
    return;
  }

  // Format items for export (flatten nested objects)
  const formattedItems = items.map((item) => ({
    Name: item.name,
    SKU: item.sku,
    Category: item.category,
    Description: item.description || '',
    Price: Math.round(item.price),
    Quantity: item.quantity,
    'Stock Value': Math.round(item.price * item.quantity),
    'Created Date': new Date(item.createdAt).toLocaleString(),
    'Updated Date': new Date(item.updatedAt).toLocaleString(),
  }));

  const csv = jsonToCSV(formattedItems);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `items_export_${date}`);
}

/**
 * Export sales to CSV
 * @param {Array} sales - Array of sale objects
 */
export function exportSalesToCSV(sales) {
  if (!sales || sales.length === 0) {
    alert('No sales to export');
    return;
  }

  // Format sales for export
  const formattedSales = sales.map((sale, index) => ({
    'Sale #': index + 1,
    'Item Name': sale.itemName,
    'Quantity Sold': sale.quantitySold,
    'Total Amount': sale.totalAmount,
    'Sale Date': new Date(sale.saleDate).toLocaleString(),
  }));

  const csv = jsonToCSV(formattedSales);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `sales_export_${date}`);
}

/**
 * Export report data to CSV
 * @param {Object} reportData - Report statistics and data
 */
export function exportReportToCSV(reportData) {
  const { stats, items, sales } = reportData;

  // Create summary section
  let csv = '=== STOCKR REPORT ===\n\n';
  csv += `Generated: ${new Date().toLocaleString()}\n\n`;
  csv += '=== SUMMARY STATISTICS ===\n';
  csv += 'Metric,Value\n';
  csv += `Total Items,${stats.totalItems}\n`;
  csv += `Total Stock,${stats.totalStock}\n`;
  csv += `Total Inventory Value,₹${Math.round(stats.totalValue)}\n`;
  csv += `Total Sales,${stats.totalSales}\n`;
  csv += `Total Revenue,₹${Math.round(stats.totalRevenue)}\n`;
  csv += `Low Stock Items,${stats.lowStockCount}\n\n`;

  // Add items section
  csv += '=== INVENTORY ITEMS ===\n';
  if (items && items.length > 0) {
    const itemsCSV = jsonToCSV(
      items.map((item) => ({
        Name: item.name,
        SKU: item.sku,
        Category: item.category,
        Quantity: item.quantity,
        Price: Math.round(item.price),
        Value: Math.round(item.price * item.quantity),
      }))
    );
    csv += itemsCSV + '\n\n';
  }

  // Add sales section
  csv += '=== SALES HISTORY ===\n';
  if (sales && sales.length > 0) {
    const salesCSV = jsonToCSV(
      sales.map((sale, index) => ({
        '#': index + 1,
        Item: sale.itemName,
        Quantity: sale.quantitySold,
        Amount: sale.totalAmount,
        Date: new Date(sale.saleDate).toLocaleString(),
      }))
    );
    csv += salesCSV + '\n';
  }

  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `full_report_${date}`);
}

/**
 * Copy data to clipboard in CSV format
 * @param {Array} data - Data to copy
 * @returns {Promise} Promise that resolves when copied
 */
export async function copyToClipboard(data) {
  const csv = jsonToCSV(data);
  try {
    await navigator.clipboard.writeText(csv);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
