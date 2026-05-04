// Data Management
let products = JSON.parse(localStorage.getItem('discount_labels')) || [
    { code: 'B001', name: 'برنجی مەحمەد ٥کگم', oldPrice: 15000, newPrice: 12500, qty: 1, design: 'design-strike', size: 'size-a6', market: 'مارکێتی نموونەیی' },
    { code: 'O002', name: 'ڕۆنی خۆراک ١لیتر', oldPrice: 3000, newPrice: 2250, qty: 1, design: 'design-cross', size: 'size-a6', market: 'مارکێتی نموونەیی' }
];

// DOM Elements
const labelsGrid = document.getElementById('labels-grid');
const emptyState = document.getElementById('empty-state');
const productForm = document.getElementById('product-form');
const editIndexInput = document.getElementById('edit-index');

// Buttons
const btnExportPdf = document.getElementById('btn-export-pdf');
const btnClearAll = document.getElementById('btn-clear-all');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderLabels();
});

// Render Labels Grid
function renderLabels() {
    labelsGrid.innerHTML = '';
    
    if (products.length === 0) {
        emptyState.classList.remove('hidden');
        labelsGrid.className = 'labels-grid'; // Reset classes
        return;
    }

    emptyState.classList.add('hidden');

    // Use the size of the first item to set the grid size (simplification)
    // Or we could have a global size setting. For now, let's apply the class to the container
    // based on the MOST RECENTLY ADDED item or a global default.
    // Actually, it's better to set the grid class based on the chosen size in the form.
    const currentSize = products[products.length - 1].size || 'size-a6';
    labelsGrid.className = `labels-grid ${currentSize}`;

    products.forEach((item, index) => {
        for (let i = 0; i < item.qty; i++) {
            const discountPercent = Math.round(((item.oldPrice - item.newPrice) / item.oldPrice) * 100);
            
            const labelCard = document.createElement('div');
            labelCard.className = `label-card shadow ${item.design || 'design-strike'}`;
            
            labelCard.innerHTML = `
                <div class="discount-badge">داشکاندن ${discountPercent}%</div>
                <div class="label-logo-container">
                    <img src="images.jpg" alt="Market Logo" class="market-logo">
                    ${item.code ? `<span class="item-code-badge">${item.code}</span>` : ''}
                </div>
                <div class="label-item-name">${item.name}</div>
                <div class="price-container">
                    <div class="old-price-wrapper">
                        <div class="old-price">${formatCurrency(item.oldPrice)} د.ع</div>
                    </div>
                    <div class="new-price">${formatCurrency(item.newPrice)}</div>
                </div>
                <div class="label-actions no-export" data-html2canvas-ignore="true">
                    <button class="btn btn-secondary btn-icon" onclick="editItem(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-icon" onclick="deleteItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            labelsGrid.appendChild(labelCard);
        }
    });

    localStorage.setItem('discount_labels', JSON.stringify(products));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US').format(amount);
}

productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newItem = {
        name: document.getElementById('item-name').value,
        oldPrice: parseFloat(document.getElementById('item-old-price').value),
        newPrice: parseFloat(document.getElementById('item-new-price').value),
        qty: parseInt(document.getElementById('item-qty').value),
        market: document.getElementById('market-name').value || 'مارکێتی نموونەیی',
        design: document.getElementById('label-design').value,
        size: document.getElementById('label-size').value,
        code: '' // Code field removed from HTML in last edit, keeping for data compatibility
    };

    const editIndex = parseInt(editIndexInput.value);

    if (editIndex === -1) {
        products.push(newItem);
    } else {
        products[editIndex] = newItem;
        productForm.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> زیادکردنی لیبڵ';
    }

    productForm.reset();
    editIndexInput.value = '-1';
    renderLabels();
});

window.editItem = (index) => {
    const item = products[index];
    editIndexInput.value = index;
    
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-old-price').value = item.oldPrice;
    document.getElementById('item-new-price').value = item.newPrice;
    document.getElementById('item-qty').value = item.qty;
    document.getElementById('market-name').value = item.market;
    document.getElementById('label-design').value = item.design;
    document.getElementById('label-size').value = item.size;
    
    productForm.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-check"></i> نوێکردنەوەی لیبڵ';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteItem = (index) => {
    if (confirm('ئایا دڵنیایت لە سڕینەوەی ئەم داشکاندنە؟')) {
        products.splice(index, 1);
        renderLabels();
    }
};

btnClearAll.addEventListener('click', () => {
    if (confirm('ئایا دڵنیایت لە سڕینەوەی هەموو لیبڵەکان؟')) {
        products = [];
        renderLabels();
    }
});

btnExportPdf.addEventListener('click', () => {
    // Rely on native print dialog which can 'Save as PDF' perfectly
    window.print();
});
