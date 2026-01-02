const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewContainer = document.getElementById('preview-container');
const imagePreview = document.getElementById('image-preview');
const removeBtn = document.getElementById('remove-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const btnText = analyzeBtn.querySelector('.btn-text');
const loader = analyzeBtn.querySelector('.loader');
const resultSection = document.getElementById('result-section');
const resetBtn = document.getElementById('reset-btn');

let currentFile = null;

// Drag and Drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropZone.classList.add('dragover');
}

function unhighlight() {
    dropZone.classList.remove('dragover');
}

dropZone.addEventListener('drop', handleDrop, false);
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            currentFile = file;
            showPreview(file);
        } else {
            alert('Please upload an image file.');
        }
    }
}

function showPreview(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        imagePreview.src = reader.result;
        dropZone.classList.add('hidden');
        previewContainer.classList.remove('hidden');
        analyzeBtn.disabled = false;
        resultSection.classList.add('hidden');
    }
}

removeBtn.addEventListener('click', () => {
    currentFile = null;
    fileInput.value = '';
    previewContainer.classList.add('hidden');
    dropZone.classList.remove('hidden');
    analyzeBtn.disabled = true;
    resultSection.classList.add('hidden');
});

analyzeBtn.addEventListener('click', uploadAndAnalyze);

async function uploadAndAnalyze() {
    if (!currentFile) return;

    // Loading state
    analyzeBtn.disabled = true;
    btnText.classList.add('hidden');
    loader.classList.remove('hidden');

    const formData = new FormData();
    formData.append('roadImage', currentFile);

    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            displayResults(data.data);
        } else {
            alert('Analysis failed: ' + data.error);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during analysis.');
    } finally {
        // Reset button state
        analyzeBtn.disabled = false;
        btnText.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}

function displayResults(data) {
    const severityMap = {
        'High': 'severity-high',
        'Medium': 'severity-medium',
        'Low': 'severity-low',
        'None': 'severity-none'
    };

    document.getElementById('res-type').textContent = data.damageType;
    document.getElementById('res-confidence').textContent = Math.round(data.confidence * 100) + '%';
    document.getElementById('res-desc').textContent = data.description;

    const severityElem = document.getElementById('res-severity');
    severityElem.textContent = data.severity;

    // Reset classes
    severityElem.className = 'value severity-badge';
    severityElem.classList.add(severityMap[data.severity] || 'severity-none');

    resultSection.classList.remove('hidden');

    // Smooth scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

resetBtn.addEventListener('click', () => {
    removeBtn.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
