// data-loader.js
class ProductDataLoader {
    constructor() {
        // REPLACE WITH YOUR GOOGLE SHEET CSV LINK
        this.sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRfHsJsbleHh9MLcH6P4-N73phXnYpwFlj2nnWyVGadOrgmFFpMxVZDJHIRgKvVmCr9MvRjLWaIukyJ/pub?output=csv';
        this.products = [];
    }

    // Convert CSV to JSON
    csvToJson(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',');
            const obj = {};
            
            headers.forEach((header, index) => {
                obj[header] = values[index] ? values[index].trim().replace(/"/g, '') : '';
            });
            
            if (obj.ID) {
                result.push(obj);
            }
        }
        
        return result;
    }

    // Fetch data from Google Sheets
    async fetchProducts() {
        try {
            const response = await fetch(this.sheetURL);
            const csv = await response.text();
            this.products = this.csvToJson(csv);
            console.log('Loaded products:', this.products);
            return this.products;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    // Get products by category
    getProductsByCategory(category) {
        if (category === 'all') return this.products;
        return this.products.filter(p => 
            p.Category && p.Category.toLowerCase() === category.toLowerCase()
        );
    }

    // Search products
    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.products.filter(p => 
            (p.Name && p.Name.toLowerCase().includes(lowerQuery)) ||
            (p.Category && p.Category.toLowerCase().includes(lowerQuery)) ||
            (p.Description && p.Description.toLowerCase().includes(lowerQuery))
        );
    }

    // Sort products
    sortProducts(products, sortBy) {
        const sorted = [...products];
        
        switch(sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => parseFloat(a.Price || 0) - parseFloat(b.Price || 0));
            case 'price-high':
                return sorted.sort((a, b) => parseFloat(b.Price || 0) - parseFloat(a.Price || 0));
            case 'name':
                return sorted.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
            default:
                return sorted;
        }
    }
}

// Create global instance
const dataLoader = new ProductDataLoader();