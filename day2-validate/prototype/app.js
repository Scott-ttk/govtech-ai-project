// Passport Application Prototype - Prompt Logic and Validation
// All data is synthetic and for prototype testing only

// Behavior prompt: track failed attempts per field
const fieldAttempts = {};
const MAX_ATTEMPTS = 2;

function trackAttempt(fieldId, isValid, currentValue) {
  if (!fieldAttempts[fieldId]) {
    fieldAttempts[fieldId] = { attempts: 0, flagged: false, lastValue: null };
  }

  const state = fieldAttempts[fieldId];

  if (isValid) {
    // Reset on success
    state.attempts = 0;
    state.flagged = false;
    state.lastValue = null;
  } else {
    // Count "times they tried to fix it but still failed"
    // - First wrong value: attempt 0 (just starting)
    // - Changed to different wrong value: increment (they tried to fix)
    // - Same wrong value again: no change (no new attempt)
    if (state.lastValue === null) {
      // First entry — don't count yet
      state.attempts = 0;
    } else if (state.lastValue !== currentValue) {
      // Changed to a new wrong value — they tried to fix it, count it
      state.attempts++;
    }
    // Same value as before — no change to attempts
    state.lastValue = currentValue;
  }

  return state;
}

function shouldOfferHelp(fieldId) {
  return fieldAttempts[fieldId] && fieldAttempts[fieldId].attempts >= MAX_ATTEMPTS;
}

function flagForHelp(fieldId, prompt, input) {
  fieldAttempts[fieldId].flagged = true;
  input.classList.add('flagged');

  // Add help link to the prompt
  const helpMessage = `<br><br><strong>Need help?</strong> <a href="#" class="help-link" data-field="${fieldId}">Speak to an officer</a> or call 6391 6100.`;
  prompt.innerHTML = prompt.textContent + helpMessage;

  // Add click handler for help link
  const helpLink = prompt.querySelector('.help-link');
  if (helpLink) {
    helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      showHelpModal(fieldId);
    });
  }
}

function showHelpModal(fieldId) {
  alert(`[Prototype] This would open a chat with an ICA officer about the "${fieldId}" field.\n\nThe application has been flagged for follow-up.`);
}

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
      // Auto-fill NRIC for demo (user still needs to click Retrieve)
      const profile = loadProfile(select.value);
      if (profile) {
        document.getElementById('nric').value = profile.nric;
      }
    }
  });
}

// NRIC entry with explicit Singpass button
function initNricPull() {
  const nricInput = document.getElementById('nric');
  const pullBtn = document.getElementById('singpass-btn');
  const pullPrompt = document.getElementById('nric-pull-prompt');

  // Validate NRIC format on blur
  nricInput.addEventListener('blur', () => {
    const value = nricInput.value.toUpperCase().trim();
    nricInput.value = value;

    if (value && !isValidNricFormat(value)) {
      showPrompt(pullPrompt, 'validation-error', 'Please enter a valid NRIC (e.g. S1234567A)');
      pullBtn.disabled = true;
    } else if (value) {
      hidePrompt(pullPrompt);
      pullBtn.disabled = false;
    }
  });

  // Singpass button triggers data pull
  pullBtn.addEventListener('click', () => {
    const value = nricInput.value.toUpperCase().trim();

    if (!value || !isValidNricFormat(value)) {
      showPrompt(pullPrompt, 'validation-error', 'Please enter a valid NRIC first');
      return;
    }

    // Show loading state
    pullBtn.textContent = 'Retrieving...';
    pullBtn.disabled = true;

    // Simulate API delay
    setTimeout(() => {
      simulateDataPull(value);
      pullBtn.textContent = 'Retrieve via Singpass';
      pullBtn.disabled = false;
    }, 800);
  });
}

function isValidNricFormat(nric) {
  return /^[STFG]\d{7}[A-Z]$/i.test(nric);
}

function simulateDataPull(nric) {
  const profileSelect = document.getElementById('profile-select');
  const pullPrompt = document.getElementById('nric-pull-prompt');

  // Find matching profile or use selected one
  let profile = Object.values(PROFILES).find(p => p.nric.toUpperCase() === nric.toUpperCase());

  if (!profile) {
    profile = loadProfile(profileSelect.value || 'complete');
  } else {
    profileSelect.value = profile.id;
    loadProfile(profile.id);
  }

  if (profile) {
    // All fields are auto-filled but editable
    populateField('name', profile.name, true);
    populateField('dob', profile.dob, true);
    populateField('gender', profile.gender, true);
    populateField('race', profile.race, true);
    populateField('address', profile.address, true);
    populateField('phone', profile.phone, true);
    populateField('email', profile.email, false); // Email not from gov records

    showPrompt(pullPrompt, 'validation-success', 'Details retrieved from government records. Please verify and update if needed.');

    // Show address note if applicable
    if (profile.addressNote) {
      const addressPrompt = document.getElementById('address-prompt');
      showPrompt(addressPrompt, 'validation-warning', profile.addressNote);
    }

    // Show phone note if applicable (e.g. missing info scenario)
    if (profile.phoneNote) {
      const phonePrompt = document.getElementById('phone-prompt');
      showPrompt(phonePrompt, 'validation-warning', profile.phoneNote);
    } else {
      // Check phone format
      validatePhone();
    }
  }
}

function populateField(fieldId, value, showAutoFilled) {
  const input = document.getElementById(fieldId);
  if (input) {
    input.value = value || '';
    input.disabled = false; // All fields are editable

    // Add auto-filled indicator
    const label = input.closest('.field').querySelector('label');
    if (showAutoFilled && value) {
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
    if (!prompt.classList.contains('validation-warning') && !prompt.classList.contains('validation-error')) {
      showPrompt(prompt, 'hint', '8-digit number starting with 8 or 9 (e.g. 91234567)');
    }
  });

  // Email validation
  const emailInput = document.getElementById('email');
  emailInput.addEventListener('blur', validateEmail);

  // Address validation
  const addressInput = document.getElementById('address');
  addressInput.addEventListener('focus', () => {
    const prompt = document.getElementById('address-prompt');
    if (!prompt.classList.contains('validation-warning')) {
      showPrompt(prompt, 'hint', 'Format: BLK [number] [street name] #[unit] SINGAPORE [postal]');
    }
  });
  addressInput.addEventListener('blur', validateAddress);
}

function validateAddress() {
  const input = document.getElementById('address');
  const prompt = document.getElementById('address-prompt');
  const value = input.value.trim().toUpperCase();

  if (!value) return;

  // Check for common abbreviations that should be expanded
  const abbreviations = [
    { abbr: /\bST\b/, full: 'STREET' },
    { abbr: /\bAVE\b/, full: 'AVENUE' },
    { abbr: /\bRD\b/, full: 'ROAD' },
    { abbr: /\bDR\b/, full: 'DRIVE' },
    { abbr: /\bS(\d{6})/, full: 'SINGAPORE $1' }, // S570123 -> SINGAPORE 570123
  ];

  let hasAbbreviation = false;
  for (const { abbr } of abbreviations) {
    if (abbr.test(value)) {
      hasAbbreviation = true;
      break;
    }
  }

  // Check if SINGAPORE is spelled out
  const hasSingapore = /SINGAPORE\s*\d{6}/.test(value);

  // Expand prompt: specific feedback on what needs to change
  if (hasAbbreviation) {
    // Find which abbreviation was used
    let found = '';
    if (/\bST\b/.test(value)) found = 'ST → STREET';
    else if (/\bAVE\b/.test(value)) found = 'AVE → AVENUE';
    else if (/\bRD\b/.test(value)) found = 'RD → ROAD';
    else if (/\bDR\b/.test(value)) found = 'DR → DRIVE';
    else if (/\bS\d{6}/.test(value)) found = 'S → SINGAPORE before postal code';

    showPrompt(prompt, 'validation-warning', `Please spell out "${found}". ICA requires full words, not abbreviations.`);
    input.classList.add('error');
  } else if (!hasSingapore && /\d{6}/.test(value)) {
    showPrompt(prompt, 'validation-warning', 'Add "SINGAPORE" before the postal code (e.g. SINGAPORE 570123, not just 570123).');
    input.classList.add('error');
  } else {
    showPrompt(prompt, 'soft-success', 'Looks good');
    input.classList.remove('error');
  }
}

function validatePhone() {
  const input = document.getElementById('phone');
  const prompt = document.getElementById('phone-prompt');
  const value = input.value.trim();

  if (!value) return;

  let isValid = false;
  let errorMessage = '';

  // Expand prompt: specific feedback on what's expected and where input falls short
  if (value.startsWith('+65')) {
    errorMessage = `You entered "${value}". Remove the +65 country code — we only need the 8-digit number (e.g. 91234567).`;
  } else if (value.startsWith('65')) {
    errorMessage = `You entered "${value}". Remove the 65 country code — we only need the 8-digit number (e.g. 91234567).`;
  } else if (value.length < 8) {
    errorMessage = `You entered ${value.length} digits. Singapore mobile numbers have exactly 8 digits starting with 8 or 9.`;
  } else if (value.length > 8) {
    errorMessage = `You entered ${value.length} digits. Singapore mobile numbers have exactly 8 digits — no spaces or dashes.`;
  } else if (!/^[89]/.test(value)) {
    errorMessage = `Your number starts with ${value[0]}. Singapore mobile numbers start with 8 or 9.`;
  } else if (!/^\d+$/.test(value)) {
    errorMessage = 'Please enter digits only — no spaces, dashes or letters.';
  } else {
    isValid = true;
  }

  // Behavior prompt: track attempts and offer help after 2 failures
  // Only counts if same wrong value is submitted twice (user isn't making progress)
  const status = trackAttempt('phone', isValid, value);

  if (isValid) {
    showPrompt(prompt, 'soft-success', 'Looks good');
    input.classList.remove('error', 'flagged');
  } else {
    const attemptType = errorMessage.includes('country code') ? 'validation-warning' : 'validation-error';
    showPrompt(prompt, attemptType, errorMessage);
    input.classList.add('error');

    if (shouldOfferHelp('phone') && !status.flagged) {
      flagForHelp('phone', prompt, input);
    }
  }
}

function validateEmail() {
  const input = document.getElementById('email');
  const prompt = document.getElementById('email-prompt');
  const value = input.value.trim();

  if (!value) return;

  // Expand prompt: specific feedback on what's missing
  if (!value.includes('@')) {
    showPrompt(prompt, 'validation-error', `You entered "${value}". Email addresses need an @ symbol (e.g. name@email.com).`);
    input.classList.add('error');
  } else if (!value.includes('.')) {
    showPrompt(prompt, 'validation-error', `You entered "${value}". Email addresses need a domain like .com or .sg after the @.`);
    input.classList.add('error');
  } else if (value.indexOf('@') === 0) {
    showPrompt(prompt, 'validation-error', 'Email address needs your name before the @ symbol.');
    input.classList.add('error');
  } else if (value.indexOf('@') === value.length - 1 || value.endsWith('@.')) {
    showPrompt(prompt, 'validation-error', 'Email address needs a domain after the @ symbol (e.g. gmail.com).');
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
  element.classList.remove('pull', 'hint', 'validation-warning', 'validation-error', 'validation-success', 'soft-success');

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
  // Clear all fields except profile selector, onboarding selects
  const inputs = document.querySelectorAll('#form-sections input:not([type="file"]), #form-sections select:not(#profile-select)');
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
