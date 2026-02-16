/**
 * Parse CSV file content into array of objects
 */
export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Expected headers for items
  const requiredHeaders = ['name', 'price', 'quantity'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  // Parse data rows
  const items = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const item = {};

    headers.forEach((header, index) => {
      item[header] = values[index] || '';
    });

    // Validate required fields
    if (!item.name) {
      errors.push(`Row ${i + 1}: Name is required`);
      continue;
    }

    // Parse and validate price
    item.price = parseFloat(item.price);
    if (isNaN(item.price) || item.price < 0) {
      errors.push(`Row ${i + 1}: Invalid price`);
      continue;
    }

    // Parse and validate quantity
    item.quantity = parseInt(item.quantity);
    if (isNaN(item.quantity) || item.quantity < 0) {
      errors.push(`Row ${i + 1}: Invalid quantity`);
      continue;
    }

    // Optional fields with defaults
    item.description = item.description || '';
    item.category = item.category || 'Uncategorized';
    item.sku = item.sku || `SKU-${Date.now()}-${i}`;

    items.push(item);
  }

  return { items, errors };
};

/**
 * Import items from CSV file
 */
export const importItemsFromCSV = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const csvText = e.target.result;
        const { items, errors } = parseCSV(csvText);

        if (items.length === 0) {
          reject(new Error('No valid items found in CSV'));
          return;
        }

        // Import items one by one
        const results = {
          success: [],
          failed: []
        };

        for (const item of items) {
          try {
            const response = await fetch('http://localhost:5000/api/items', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              },
              body: JSON.stringify(item)
            });

            const data = await response.json();

            if (data.success) {
              results.success.push(item.name);
            } else {
              results.failed.push({ name: item.name, error: data.message });
            }
          } catch (error) {
            results.failed.push({ name: item.name, error: error.message });
          }
        }

        resolve({ ...results, parseErrors: errors });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Download CSV template
 */
export const downloadCSVTemplate = () => {
  const headers = ['name', 'description', 'category', 'price', 'quantity', 'sku'];
  const sampleData = [
    ['Laptop', 'High-performance laptop', 'Electronics', '50000', '10', 'ELEC-LAP-001'],
    ['Mouse', 'Wireless mouse', 'Electronics', '500', '50', 'ELEC-MOU-001'],
    ['Notebook', 'A4 size notebook', 'Stationery', '50', '100', 'STAT-NOT-001']
  ];

  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'items_template.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
