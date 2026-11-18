// Passport Application Prototype - Prompt Logic and Validation
// All data is synthetic and for prototype testing only

document.addEventListener('DOMContentLoaded', () => {
  initProfileSwitcher();
  initNricPull();
  initFieldValidations();
  initPhotoUpload();
  initFormSubmit();
});

// Profile switcher for demo
function initProfileSwitcher() {
  const select = document.getElementById('profile-select');
  const profiles = getProfiles();

  profiles.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.label;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    if (select.value) {
      resetForm();
    }
  });
}

// NRIC entry triggers data pull
function initNricPull() {
  const nricInput = document.getElementById('nric');
  const pullPrompt = document.getElementById('nric-pull-prompt');

  // Show pull prompt when user focuses on NRIC
  nricInput.addEventListener('focus', () => {
    showPrompt(pullPrompt, 'pull');
  });

  // Validate and pull data on blur
  nricInput.addEventListener('blur', () => {
    const value = nricInput.value.toUpperCase().trim();
    nricInput.value = value;

    if (value && isValidNricFormat(value)) {
      simulateDataPull(value);
    } else if (value) {
      showPrompt(pullPrompt, 'validation-error', 'Please enter a valid NRIC (e.g. S1234567A)');
    }
  });

  // Also trigger on Enter key
  nricInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nricInput.blur();
    }
  });
}

function isValidNricFormat(nric) {
  return /^[STFG]\d{7}[A-Z]$/i.test(nric);
}

function simulateDataPull(nric) {
  const profileSelect = document.getElementById('profile-select');
  const pullPrompt = document.getElementById('nric-pull-prompt');

  // Find matching profile or use first one
  let profile = Object.values(PROFILES).find(p => p.nric.toUpperCase() === nric.toUpperCase());

  if (!profile) {
    // For demo, load selected profile or default
    profile = loadProfile(profileSelect.value || 'complete');
  } else {
    profileSelect.value = profile.id;
    loadProfile(profile.id);
  }

  if (profile) {
    // Populate auto-filled fields
    populateField('name', profile.name, true);
    populateField('dob', profile.dob, true);
    populateField('gender', profile.gender, true);
    populateField('race', profile.race, true);
    populateField('address', profile.address, false); // Editable
    populateField('phone', profile.phone, false);
    populateField('email', profile.email, false);

    showPrompt(pullPrompt, 'validation-success', 'Details retrieved from government records. Please verify and complete the remaining fields.');

    // If address has a note, show it
    if (profile.addressNote) {
      const addressPrompt = document.getElementById('address-prompt');
      showPrompt(addressPrompt, 'validation-warning', profile.addressNote);
    }

    // Check phone format
    validatePhone();
  }
}

function populateField(fieldId, value, readonly) {
  const input = document.getElementById(fieldId);
  if (input) {
    input.value = value || '';
    input.disabled = readonly;

    // Add auto-filled indicator for readonly fields
    const label = input.closest('.field').querySelector('label');
    if (readonly && value) {
      if (!label.querySelector('.auto-filled')) {
        const badge = document.createElement('span');
        badge.className = 'auto-filled';
        badge.textContent = 'Auto-filled';
        label.appendChild(badge);
      }
    }
  }
}

// Field validations
function initFieldValidations() {
  // Phone validation
  const phoneInput = document.getElementById('phone');
  phoneInput.addEventListener('blur', validatePhone);
  phoneInput.addEventListener('focus', () => {
    const prompt = document.getElementById('phone-prompt');
    showPrompt(prompt, 'hint', '8-digit number starting with 8 or 9 (e.g. 91234567)');
  });

  // Email validation
  const emailInput = document.getElementById('email');
  emailInput.addEventListener('blur', validateEmail);

  // Address hint
  const addressInput = document.getElementById('address');
  addressInput.addEventListener('focus', () => {
    const prompt = document.getElementById('address-prompt');
    if (!prompt.classList.contains('validation-warning')) {
      showPrompt(prompt, 'hint', 'Format: BLK [number] [street name] #[unit] SINGAPORE [postal]');
    }
  });
}

function validatePhone() {
  const input = document.getElementById('phone');
  const prompt = document.getElementById('phone-prompt');
  const value = input.value.trim();

  if (!value) return;

  // Check for common format errors
  if (value.startsWith('65') || value.startsWith('+65')) {
    showPrompt(prompt, 'validation-warning', 'Please enter without country code. Just the 8-digit number.');
    input.classList.add('error');
  } else if (!/^[89]\d{7}$/.test(value)) {
    showPrompt(prompt, 'validation-error', 'Please enter a valid 8-digit mobile number starting with 8 or 9');
    input.classList.add('error');
  } else {
    showPrompt(prompt, 'validation-success', 'Format looks correct');
    input.classList.remove('error');
  }
}

function validateEmail() {
  const input = document.getElementById('email');
  const prompt = document.getElementById('email-prompt');
  const value = input.value.trim();

  if (!value) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    showPrompt(prompt, 'validation-error', 'Please enter a valid email address');
    input.classList.add('error');
  } else {
    hidePrompt(prompt);
    input.classList.remove('error');
  }
}

// Photo upload
function initPhotoUpload() {
  const uploadArea = document.getElementById('photo-upload');
  const fileInput = document.getElementById('photo-file');
  const prompt = document.getElementById('photo-prompt');

  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary)';
    uploadArea.style.background = 'var(--primary-light)';
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
    if (e.dataTransfer.files.length) {
      handlePhotoUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      handlePhotoUpload(fileInput.files[0]);
    }
  });

  // Show hint on hover
  uploadArea.addEventListener('mouseenter', () => {
    showPrompt(prompt, 'hint', 'Requirements: Recent colour photo, white background, 400x514 pixels minimum, JPEG format');
  });
}

function handlePhotoUpload(file) {
  const prompt = document.getElementById('photo-prompt');
  const uploadText = document.querySelector('.photo-upload-text');

  // Check file type
  if (!file.type.startsWith('image/')) {
    showPrompt(prompt, 'validation-error', 'Please upload an image file (JPEG or PNG)');
    return;
  }

  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showPrompt(prompt, 'validation-error', 'File is too large. Maximum size is 2MB.');
    return;
  }

  // Simulate dimension check
  const img = new Image();
  img.onload = () => {
    if (img.width < 400 || img.height < 514) {
      showPrompt(prompt, 'validation-warning', `Image dimensions (${img.width}x${img.height}) may be too small. Recommended: at least 400x514 pixels.`);
    } else {
      showPrompt(prompt, 'validation-success', 'Photo uploaded. Please ensure it meets the passport photo requirements.');
    }
    uploadText.innerHTML = `<strong>${file.name}</strong> uploaded`;
  };
  img.src = URL.createObjectURL(file);
}

// Form submission
function initFormSubmit() {
  const form = document.getElementById('passport-form');
  const submitBtn = document.getElementById('submit-btn');
  const modal = document.getElementById('confirm-modal');
  const confirmBtn = document.getElementById('confirm-submit');
  const cancelBtn = document.getElementById('cancel-submit');

  submitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = validateAllFields();

    if (errors.length > 0) {
      alert('Please fix the following issues:\n\n' + errors.join('\n'));
      return;
    }

    // Show confirmation modal
    populateSummary();
    modal.classList.add('visible');
  });

  confirmBtn.addEventListener('click', () => {
    modal.classList.remove('visible');
    alert('Application submitted successfully!\n\n(This is a prototype - no actual submission occurred)');
  });

  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('visible');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('visible');
    }
  });
}

function validateAllFields() {
  const errors = [];

  const nric = document.getElementById('nric').value.trim();
  if (!nric || !isValidNricFormat(nric)) {
    errors.push('- Please enter a valid NRIC');
  }

  const name = document.getElementById('name').value.trim();
  if (!name) {
    errors.push('- Name is required');
  }

  const phone = document.getElementById('phone').value.trim();
  if (!phone || !/^[89]\d{7}$/.test(phone)) {
    errors.push('- Please enter a valid 8-digit phone number');
  }

  const email = document.getElementById('email').value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('- Please enter a valid email address');
  }

  const reason = document.getElementById('reason').value;
  if (!reason) {
    errors.push('- Please select a reason for application');
  }

  return errors;
}

function populateSummary() {
  const summaryList = document.getElementById('summary-list');
  summaryList.innerHTML = '';

  const fields = [
    { label: 'NRIC', id: 'nric' },
    { label: 'Name', id: 'name' },
    { label: 'Date of Birth', id: 'dob' },
    { label: 'Gender', id: 'gender' },
    { label: 'Address', id: 'address' },
    { label: 'Phone', id: 'phone' },
    { label: 'Email', id: 'email' },
    { label: 'Reason', id: 'reason' }
  ];

  fields.forEach(field => {
    const value = document.getElementById(field.id).value;
    if (value) {
      const li = document.createElement('li');
      li.innerHTML = `<span class="summary-label">${field.label}</span><span class="summary-value">${value}</span>`;
      summaryList.appendChild(li);
    }
  });
}

// Utility functions
function showPrompt(element, type, message) {
  if (!element) return;

  // Remove all type classes
  element.classList.remove('pull', 'hint', 'validation-warning', 'validation-error', 'validation-success');

  // Add new type class
  element.classList.add(type);

  // Update message if provided
  if (message) {
    element.textContent = message;
  }

  element.classList.add('visible');
}

function hidePrompt(element) {
  if (element) {
    element.classList.remove('visible');
  }
}

function resetForm() {
  // Clear all fields
  const inputs = document.querySelectorAll('input:not([type="file"]), select');
  inputs.forEach(input => {
    input.value = '';
    input.disabled = false;
    input.classList.remove('error');
  });

  // Remove auto-filled badges
  document.querySelectorAll('.auto-filled').forEach(el => el.remove());

  // Hide all prompts
  document.querySelectorAll('.prompt').forEach(el => {
    el.classList.remove('visible');
  });

  // Reset photo upload text
  const uploadText = document.querySelector('.photo-upload-text');
  if (uploadText) {
    uploadText.innerHTML = '<strong>Click to upload</strong> or drag and drop<br>JPEG or PNG, max 2MB';
  }
}
