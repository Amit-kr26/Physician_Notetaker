const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const notification = document.getElementById('notification');

// Check for saved theme
const savedTheme = localStorage.getItem('theme');
body.setAttribute('data-theme', savedTheme || 'dark');

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Enhanced file input handling
const fileInput = document.getElementById('fileInput');
const fileText = document.querySelector('.file-text');

fileInput.addEventListener('change', function(e) {
    if (this.files[0]) {
        fileText.textContent = this.files[0].name;
    }
});

document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const download = document.getElementById('download');

    loading.style.display = 'flex';
    setTimeout(() => {
        loading.style.opacity = '1';
    }, 10);

    result.style.display = 'none';
    download.style.display = 'none';

    fetch('/process', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error('Server error');
        return response.json();
    })
    .then(data => {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);

        result.style.display = 'block';
        download.style.display = 'flex';

        // Create structured JSON display
        const resultContent = document.createElement('div');
        resultContent.className = 'result-content';
        result.innerHTML = ''; // Clear previous results

        const formatValue = (value) => {
            if (typeof value === 'object' && value !== null) {
                return JSON.stringify(value, null, 2);
            }
            return value;
        };

        Object.entries(data).forEach(([key, value]) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'json-item';

            const keySpan = document.createElement('span');
            keySpan.className = 'json-key';
            keySpan.textContent = `${key}:`;

            const valueSpan = document.createElement('span');
            valueSpan.className = 'json-value';
            valueSpan.innerHTML = formatValue(value)
                .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
                match => {
                    let cls = 'number';
                    if (/^"/.test(match)) cls = 'string';
                    else if (/true|false/.test(match)) cls = 'boolean';
                    else if (/null/.test(match)) cls = 'null';
                    return `<span class="${cls}">${match}</span>`;
                });

            itemDiv.appendChild(keySpan);
            itemDiv.appendChild(valueSpan);
            resultContent.appendChild(itemDiv);
        });

        result.appendChild(resultContent);

        // Add copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy to Clipboard';
        copyBtn.style.background = 'var(--primary)';
        copyBtn.style.color = 'white';
        copyBtn.style.border = 'none';
        copyBtn.style.padding = '0.5rem 1rem';
        copyBtn.style.borderRadius = '4px';
        copyBtn.style.cursor = 'pointer';
        copyBtn.style.marginTop = '1rem';
        copyBtn.style.transition = 'background 0.3s ease';
        copyBtn.addEventListener('mouseover', () => {
            copyBtn.style.background = 'var(--primary-dark)';
        });
        copyBtn.addEventListener('mouseout', () => {
            copyBtn.style.background = 'var(--primary)';
        });
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(JSON.stringify(data, null, 2))
                .then(() => {
                    notification.textContent = 'Copied to clipboard!';
                    notification.style.background = 'var(--primary)';
                    notification.style.opacity = '1';
                    setTimeout(() => {
                        notification.style.opacity = '0';
                    }, 3000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                });
        });
        result.appendChild(copyBtn);

        // Show success notification
        notification.textContent = 'Transcript processed successfully!';
        notification.style.background = 'var(--primary)';
        notification.style.opacity = '1';
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 3000);

        download.onclick = () => {
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'medical-notes.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
    })
    .catch(error => {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);

        result.style.display = 'block';
        result.innerHTML = `<div class="error">Error: ${error.message}</div>`;

        // Show error notification
        notification.textContent = `Error: ${error.message}`;
        notification.style.background = '#ff4444';
        notification.style.opacity = '1';
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 5000);
    });
});

const uploadArea = document.getElementById('uploadArea');

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--light-primary)';
    uploadArea.style.backgroundColor = 'rgba(67, 97, 238, 0.05)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '';
    uploadArea.style.backgroundColor = '';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.backgroundColor = '';
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        fileText.textContent = fileInput.files[0].name;
    }
});