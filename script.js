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

const btnMobilePdf = document.getElementById('btn-mobile-pdf');
if (btnMobilePdf) {
    btnMobilePdf.addEventListener('click', () => {
        const element = document.getElementById('printable-area');

        btnMobilePdf.disabled = true;
        const originalText = btnMobilePdf.innerHTML;
        btnMobilePdf.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ئامادەکردن...';

        element.classList.add('pdf-rendering');
        
        try {
            // Use html2canvas directly to create an Image, which is much better for mobile sharing
            html2canvas(element, { scale: 2, useCORS: true, logging: false }).then(canvas => {
                element.classList.remove('pdf-rendering');
                btnMobilePdf.disabled = false;
                btnMobilePdf.innerHTML = originalText;
                
                // Convert to Image URL
                const imgData = canvas.toDataURL('image/png');
                
                // Create a download link
                const link = document.createElement('a');
                link.download = `SoranBazar_Label_${new Date().getTime()}.png`;
                link.href = imgData;
                
                // Append to body, click, and remove (required for some mobile browsers)
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }).catch(err => {
                console.error("Canvas Generation Error:", err);
                element.classList.remove('pdf-rendering');
                btnMobilePdf.disabled = false;
                btnMobilePdf.innerHTML = originalText;
                alert('ببورە، کێشەیەک ڕوویدا. تکایە دڵنیابە لەناو وێبگەڕی کرۆم یان سەفاری سایتەکەت کردۆتەوە.');
            });
        } catch(e) {
            console.error(e);
            element.classList.remove('pdf-rendering');
            btnMobilePdf.disabled = false;
            btnMobilePdf.innerHTML = originalText;
            alert('کێشەیەک لە سیستەمەکەدا هەیە.');
        }
    });
}
