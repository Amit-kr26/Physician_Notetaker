// Theme Management
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const notification = document.getElementById('notification');
const toggleText = document.querySelector('.toggle-text');
const lightIcon = document.querySelector('.toggle-icon.light');
const darkIcon = document.querySelector('.toggle-icon.dark');

// Initialize theme - Using localStorage instead of sessionStorage for persistence
const savedTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', savedTheme);
updateThemeToggle();

function updateThemeToggle() {
    const currentTheme = body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        if (lightIcon) lightIcon.classList.add('hide');
        if (darkIcon) darkIcon.classList.remove('hide');
        if (toggleText) toggleText.textContent = 'Light Mode';
    } else {
        if (darkIcon) darkIcon.classList.add('hide');
        if (lightIcon) lightIcon.classList.remove('hide');
        if (toggleText) toggleText.textContent = 'Dark Mode';
    }
}

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle();
    
    showNotification(`Switched to ${newTheme} mode`, 'success');
});

// Enhanced file input handling
const fileInput = document.getElementById('fileInput');
const fileText = document.querySelector('.file-text');
const uploadArea = document.getElementById('uploadArea');
const uploadIcon = document.querySelector('.upload-icon i');

fileInput.addEventListener('change', function(e) {
    if (this.files[0]) {
        const file = this.files[0];
        fileText.textContent = `📄 ${file.name} (${formatFileSize(file.size)})`;
        fileText.style.color = 'var(--light-accent)';
        if (uploadIcon) uploadIcon.className = 'fas fa-file-check';
        
        // Add file preview animation
        uploadArea.style.borderColor = 'var(--light-accent)';
        setTimeout(() => {
            uploadArea.style.borderColor = '';
        }, 2000);
    }
});

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Enhanced drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
    uploadArea.style.transform = 'scale(1.02)';
    uploadArea.style.borderColor = 'var(--light-primary)';
    uploadArea.style.backgroundColor = 'rgba(67, 97, 238, 0.05)';
});

uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    uploadArea.style.transform = '';
    uploadArea.style.borderColor = '';
    uploadArea.style.backgroundColor = '';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    uploadArea.style.transform = '';
    uploadArea.style.borderColor = '';
    uploadArea.style.backgroundColor = '';
    
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        const file = fileInput.files[0];
        fileText.textContent = `📄 ${file.name} (${formatFileSize(file.size)})`;
        fileText.style.color = 'var(--light-accent)';
        if (uploadIcon) uploadIcon.className = 'fas fa-file-check';
        
        // Success animation
        showNotification('File uploaded successfully!', 'success');
    }
});

// Form submission with real server processing
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const download = document.getElementById('download');
    const mainContent = document.querySelector('.main-content');

    // Show loading with smooth transition
    loading.style.display = 'flex';
    setTimeout(() => {
        loading.style.opacity = '1';
        loading.classList.add('show');
    }, 10);
    
    if (mainContent) {
        mainContent.style.filter = 'blur(2px)';
        mainContent.style.opacity = '0.5';
    }

    // Hide previous results
    result.style.display = 'none';
    if (download) download.style.display = 'none';

    // Progress tracking for real processing
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 85) {
            clearInterval(progressInterval);
        }
        updateLoadingProgress(progress);
    }, 800);

    // Real API call to server
    fetch('/process', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        clearInterval(progressInterval);
        updateLoadingProgress(100);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Hide loading
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
            loading.classList.remove('show');
        }, 500);
        
        if (mainContent) {
            mainContent.style.filter = '';
            mainContent.style.opacity = '';
        }

        // Show real results
        displayServerResults(data);
        result.style.display = 'block';
        result.classList.add('show');
        
        if (download) {
            download.style.display = 'flex';
            // Set up download functionality with real data
            download.onclick = () => {
                const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `medical-notes-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification('Medical notes downloaded successfully!', 'success');
            };
        }
        
        showNotification('Medical notes processed successfully!', 'success');
    })
    .catch(error => {
        clearInterval(progressInterval);
        
        // Hide loading
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
            loading.classList.remove('show');
        }, 500);
        
        if (mainContent) {
            mainContent.style.filter = '';
            mainContent.style.opacity = '';
        }

        // Show error
        result.style.display = 'block';
        result.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        
        showNotification(`Error: ${error.message}`, 'error');
    });
});

function updateLoadingProgress(progress) {
    const loadingText = document.querySelector('.loading-text');
    const subtext = document.querySelector('.loading-subtext');
    
    if (loadingText && subtext) {
        if (progress < 30) {
            loadingText.textContent = 'Analyzing document structure...';
            subtext.textContent = 'Reading and parsing your medical transcript';
        } else if (progress < 60) {
            loadingText.textContent = 'Extracting medical information...';
            subtext.textContent = 'Identifying symptoms, diagnoses, and treatments';
        } else if (progress < 90) {
            loadingText.textContent = 'Structuring clinical notes...';
            subtext.textContent = 'Organizing data into SOAP format';
        } else {
            loadingText.textContent = 'Finalizing results...';
            subtext.textContent = 'Almost ready to display your structured notes';
        }
    }
}

function displayServerResults(data) {
    const resultContent = document.getElementById('resultContent') || document.querySelector('#result');
    if (!resultContent) return;
    
    // Clear previous results
    resultContent.innerHTML = '';
    
    // Create structured display container
    const container = document.createElement('div');
    container.className = 'result-content';
    
    displayStructuredData(data, container);
    resultContent.appendChild(container);

    // Store data for copy/download functions
    window.currentResultData = data;
}

function displayStructuredData(data, container) {
    Object.entries(data).forEach(([key, value], index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'json-item';
        itemDiv.style.animationDelay = `${index * 0.1}s`;

        const keySpan = document.createElement('div');
        keySpan.className = 'json-key';
        keySpan.textContent = key;

        const valueSpan = document.createElement('div');
        valueSpan.className = 'json-value';
        
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                // Handle arrays
                valueSpan.innerHTML = value.map(item => `• ${item}`).join('<br>');
            } else {
                // Handle nested objects (like SOAP assessment)
                valueSpan.innerHTML = formatObjectValue(value);
            }
        } else {
            valueSpan.innerHTML = formatPrimitiveValue(value);
        }

        itemDiv.appendChild(keySpan);
        itemDiv.appendChild(valueSpan);
        container.appendChild(itemDiv);
    });
}

function formatObjectValue(obj) {
    let html = '<div class="nested-object">';
    
    Object.entries(obj).forEach(([subKey, subValue]) => {
        html += `<div class="nested-item">`;
        html += `<strong class="nested-key">${subKey}:</strong> `;
        
        if (typeof subValue === 'object' && subValue !== null) {
            if (Array.isArray(subValue)) {
                html += `<div class="nested-array">`;
                html += subValue.map(item => `• ${item}`).join('<br>');
                html += `</div>`;
            } else {
                // Handle deeply nested objects
                html += `<div class="deeply-nested">`;
                html += formatObjectValue(subValue);
                html += `</div>`;
            }
        } else {
            html += `<span class="nested-value">${formatPrimitiveValue(subValue)}</span>`;
        }
        
        html += `</div>`;
    });
    
    html += '</div>';
    return html;
}

function formatPrimitiveValue(value) {
    if (value === null) return '<span class="null">null</span>';
    if (typeof value === 'boolean') return `<span class="boolean">${value}</span>`;
    if (typeof value === 'number') return `<span class="number">${value}</span>`;
    if (typeof value === 'string') {
        // Handle strings that might contain JSON-like formatting
        return `<span class="string">${value}</span>`;
    }
    return String(value);
}

// Enhanced button functionality
const copyBtn = document.getElementById('copyBtn');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        if (window.currentResultData) {
            navigator.clipboard.writeText(JSON.stringify(window.currentResultData, null, 2))
                .then(() => {
                    showNotification('Results copied to clipboard!', 'success');
                    // Button animation
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    showNotification('Failed to copy to clipboard', 'error');
                });
        }
    });
}

const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        if (window.currentResultData) {
            const blob = new Blob([JSON.stringify(window.currentResultData, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `medical-notes-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('Medical notes downloaded successfully!', 'success');
        }
    });
}

const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        if (navigator.share && window.currentResultData) {
            navigator.share({
                title: 'Medical Notes - Physician Notetaker',
                text: 'Structured medical notes generated by AI',
                url: window.location.href
            }).then(() => {
                showNotification('Notes shared successfully!', 'success');
            }).catch(() => {
                showNotification('Sharing not supported on this device', 'error');
            });
        } else {
            // Fallback: copy share link
            navigator.clipboard.writeText(window.location.href).then(() => {
                showNotification('Share link copied to clipboard!', 'success');
            });
        }
    });
}

// Enhanced notification system
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.opacity = '1';
    
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 4000);
}

// Add some interactive elements on load
document.addEventListener('DOMContentLoaded', () => {
    // Animate stats on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statsPanel = document.querySelector('.stats-panel');
    if (statsPanel) {
        observer.observe(statsPanel);
    }
});

function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((stat, index) => {
        const finalValue = stat.textContent;
        stat.textContent = '0';
        
        setTimeout(() => {
            if (finalValue.includes('%')) {
                animateNumber(stat, 0, parseFloat(finalValue), '%');
            } else if (finalValue.includes('k+')) {
                animateNumber(stat, 0, parseFloat(finalValue) * 1000, 'k+', 1000);
            } else if (finalValue.includes('s')) {
                stat.textContent = finalValue; // Keep as is for time values
            }
        }, index * 200);
    });
}

function animateNumber(element, start, end, suffix = '', divisor = 1) {
    const duration = 2000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (end - start) * easeOutQuart;
        
        if (divisor > 1) {
            element.textContent = (current / divisor).toFixed(1) + suffix;
        } else {
            element.textContent = current.toFixed(1) + suffix;
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'u':
                e.preventDefault();
                fileInput.click();
                break;
            case 'd':
                e.preventDefault();
                if (window.currentResultData && downloadBtn) {
                    downloadBtn.click();
                }
                break;
            case 'c':
                if (e.shiftKey && window.currentResultData && copyBtn) {
                    e.preventDefault();
                    copyBtn.click();
                }
                break;
        }
    }
    
    if (e.key === 'Escape') {
        const loading = document.getElementById('loading');
        if (loading && loading.classList.contains('show')) {
            // Allow canceling upload
            loading.classList.remove('show');
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 500);
            
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.filter = '';
                mainContent.style.opacity = '';
            }
            showNotification('Process cancelled', 'error');
        }
    }
});

// Add tooltips for accessibility
const tooltipElements = [
    { element: '#themeToggle', text: 'Switch between light and dark themes (Ctrl+T)' },
    { element: '#fileInput', text: 'Upload medical transcript file (Ctrl+U)' },
    { element: '#copyBtn', text: 'Copy results to clipboard (Ctrl+Shift+C)' },
    { element: '#downloadBtn', text: 'Download structured notes (Ctrl+D)' }
];

tooltipElements.forEach(({ element, text }) => {
    const el = document.querySelector(element);
    if (el) {
        el.setAttribute('title', text);
    }
});

// Performance optimization: Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Handle responsive adjustments if needed
        const container = document.querySelector('.container');
        if (container) {
            if (window.innerWidth < 768) {
                container.style.padding = '1rem';
            } else {
                container.style.padding = '2rem';
            }
        }
    }, 250);
});