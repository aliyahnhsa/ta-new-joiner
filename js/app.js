// Configuration
const CONFIG = {
    WEBHOOK_URL: "https://defaultce2a22364fea4cc9841385fac29c93.67.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/16/workflows/6e6642cbf1a24c0d9d53c15f7803c3a2/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=y4I6h7WdbNoXOF3VVWZA0g8RbBlZtn3CgM8PYMQaP48",
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Utility Functions
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.readAsDataURL(file);
        
        reader.onload = () => {
            resolve({
                fileName: file.name,
                mimeType: file.type,
                content: reader.result.split(',')[1] // Remove data:image/png;base64, prefix
            });
        };
        
        reader.onerror = (error) => reject(error);
    });
}

function validateFile(file) {
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        return {
            valid: false,
            message: 'File size exceeds 5MB limit'
        };
    }
    
    // Optionally validate file type
    // if (!CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
    //     return {
    //         valid: false,
    //         message: 'Invalid file type'
    //     };
    // }
    
    return { valid: true };
}

function showStatus(message, isSuccess) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = 'status-message ' + (isSuccess ? 'success' : 'error');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusElement.className = 'status-message';
        statusElement.style.display = 'none';
    }, 5000);
}

function setFormState(isSubmitting) {
    const submitButton = document.querySelector('.btn-submit');
    const inputs = document.querySelectorAll('input, textarea, button');
    
    inputs.forEach(input => {
        input.disabled = isSubmitting;
    });
    
    submitButton.textContent = isSubmitting ? 'Submitting...' : 'Submit';
}

// Main Form Handler
async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        setFormState(true);
        
        // Get form values
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const attachmentInput = document.getElementById('attachment');
        
        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            message: messageInput.value.trim(),
            attachment: null,
            timestamp: new Date().toISOString()
        };
        
        // Handle file attachment if present
        const file = attachmentInput.files[0];
        if (file) {
            const validation = validateFile(file);
            if (!validation.valid) {
                showStatus(validation.message, false);
                setFormState(false);
                return;
            }
            
            formData.attachment = await convertToBase64(file);
        }
        
        // Send to Power Automate webhook
        console.log('Sending data to webhook:', CONFIG.WEBHOOK_URL);
        console.log('Payload:', formData);
        
        const response = await fetch(CONFIG.WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
            showStatus('Your message has been submitted successfully!', true);
            document.getElementById('contactForm').reset();
        } else {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`Server returned ${response.status}: ${errorText}`);
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        
        // Show detailed error message
        let errorMessage = 'Failed to submit. ';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Network error - Check CORS or internet connection.';
        } else if (error.message.includes('401')) {
            errorMessage += 'Unauthorized - Check Power Automate authentication.';
        } else if (error.message.includes('404')) {
            errorMessage += 'Webhook URL not found - Check Power Automate URL.';
        } else if (error.message.includes('500')) {
            errorMessage += 'Server error - Check Power Automate flow.';
        } else {
            errorMessage += error.message;
        }
        
        showStatus(errorMessage, false);
    } finally {
        setFormState(false);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', handleFormSubmit);
    
    // Optional: File input change handler
    const attachmentInput = document.getElementById('attachment');
    attachmentInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const validation = validateFile(file);
            if (!validation.valid) {
                showStatus(validation.message, false);
                attachmentInput.value = '';
            }
        }
    });
});
