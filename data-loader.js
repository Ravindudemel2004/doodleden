// data-loader.js
class ProductDataLoader {
    constructor() {
        this.sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRfHsJsbleHh9MLcH6P4-N73phXnYpwFlj2nnWyVGadOrgmFFpMxVZDJHIRgKvVmCr9MvRjLWaIukyJ/pub?output=csv';
        this.products = [];
    }

    // Convert Google Drive share link to direct image link
    convertGoogleDriveUrl(url) {
        if (!url || url.trim() === '') return '';
        
        // If already a direct link, return as is
        if (url.includes('googleapis.com') || url.includes('uc?export=view')) {
            return url;
        }
        
        // Extract file ID from various Google Drive URL formats
        let fileId = '';
        
        // Format 1: https://drive.google.com/file/d/FILE_ID/view
        const match1 = url.match(/\/file\/d\/([^/]+)/);
        if (match1 && match1[1]) {
            fileId = match1[1];
        }
        
        // Format 2: https://drive.google.com/open?id=FILE_ID
        const match2 = url.match(/[?&]id=([^&]+)/);
        if (match2 && match2[1]) {
            fileId = match2[1];
        }
        
        // Format 3: Just the file ID
        if (!fileId && url.length > 20) {
            fileId = url;
        }
        
        // Convert to direct link
        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
        
        return url;
    }

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
                // Convert Google Drive URL if present
                if (obj['Image URL']) {
                    obj['Image URL'] = this.convertGoogleDriveUrl(obj['Image URL']);
                }
                result.push(obj);
            }
        }
        
        return result;
    }

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

    getProductsByCategory(category) {
        if (category === 'all') return this.products;
        return this.products.filter(p => 
            p.Category && p.Category.toLowerCase() === category.toLowerCase()
        );
    }

    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.products.filter(p => 
            (p.Name && p.Name.toLowerCase().includes(lowerQuery)) ||
            (p.Category && p.Category.toLowerCase().includes(lowerQuery)) ||
            (p.Description && p.Description.toLowerCase().includes(lowerQuery))
        );
    }

    sortProducts(products, sortBy) {
        const sorted = [...products];
        
        switch(sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => parseFloat(a['Price (LKR)'] || a.Price || 0) - parseFloat(b['Price (LKR)'] || b.Price || 0));
            case 'price-high':
                return sorted.sort((a, b) => parseFloat(b['Price (LKR)'] || b.Price || 0) - parseFloat(a['Price (LKR)'] || a.Price || 0));
            case 'name':
                return sorted.sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
            default:
                return sorted;
        }
    }
}

const dataLoader = new ProductDataLoader();
