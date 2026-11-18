// Passport Application Prototype - Prompt Logic and Validation
// All data is synthetic and for prototype testing only
// Validation rules and messages are in config.js

// Behavior prompt: track failed attempts per field
const fieldAttempts = {};

function trackAttempt(fieldId, isValid, currentValue) {
  if (!fieldAttempts[fieldId]) {
    fieldAttempts[fieldId] = { attempts: 0, flagged: false, lastValue: null };
  }

  const state = fieldAttempts[fieldId];

  if (isValid) {
    state.attempts = 0;
    state.flagged = false;
    state.lastValue = null;
  } else {
    if (state.lastValue === null) {
      state.attempts = 0;
    } else if (state.lastValue !== currentValue) {
      state.attempts++;
    }
    state.lastValue = currentValue;
  }

  return state;
}

function shouldOfferHelp(fieldId) {
  return fieldAttempts[fieldId] && fieldAttempts[fieldId].attempts >= CONFIG.maxAttempts;
}

function flagForHelp(fieldId, prompt, input) {
  fieldAttempts[fieldId].flagged = true;
  input.classList.add('flagged');

  prompt.innerHTML = prompt.textContent + CONFIG.help.message(fieldId);

  const helpLink = prompt.querySelector('.help-link');
  if (helpLink) {
    helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      showHelpModal(fieldId);
    });
  }
}

function showHelpModal(fieldId) {
  alert(CONFIG.help.modalMessage(fieldId));
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

  nricInput.addEventListener('blur', () => {
    const value = nricInput.value.toUpperCase().trim();
    nricInput.value = value;

    if (value && !isValidNricFormat(value)) {
      showPrompt(pullPrompt, 'validation-error', CONFIG.nric.messages.invalid);
      pullBtn.disabled = true;
    } else if (value) {
      hidePrompt(pullPrompt);
      pullBtn.disabled = false;
    }
  });

  pullBtn.addEventListener('click', () => {
    const value = nricInput.value.toUpperCase().trim();

    if (!value || !isValidNricFormat(value)) {
      showPrompt(pullPrompt, 'validation-error', CONFIG.nric.messages.invalid);
      return;
    }

    pullBtn.textContent = CONFIG.singpass.messages.loading;
    pullBtn.disabled = true;

    setTimeout(() => {
      simulateDataPull(value);
      pullBtn.textContent = CONFIG.singpass.messages.buttonText;
      pullBtn.disabled = false;
    }, 800);
  });
}

function isValidNricFormat(nric) {
  return CONFIG.nric.pattern.test(nric);
}

function simulateDataPull(nric) {
  const profileSelect = document.getElementById('profile-select');
  const pullPrompt = document.getElementById('nric-pull-prompt');

  let profile = Object.values(PROFILES).find(p => p.nric.toUpperCase() === nric.toUpperCase());

  if (!profile) {
    profile = loadProfile(profileSelect.value || 'complete');
  } else {
    profileSelect.value = profile.id;
    loadProfile(profile.id);
  }

  if (profile) {
    populateField('name', profile.name, true);
    populateField('dob', profile.dob, true);
    populateField('gender', profile.gender, true);
    populateField('race', profile.race, true);
    populateField('address', profile.address, true);
    populateField('phone', profile.phone, true);
    populateField('email', profile.email, false);

    showPrompt(pullPrompt, 'validation-success', CONFIG.singpass.messages.success);

    if (profile.addressNote) {
      const addressPrompt = document.getElementById('address-prompt');
      showPrompt(addressPrompt, 'validation-warning', profile.addressNote);
    }

    if (profile.phoneNote) {
      const phonePrompt = document.getElementById('phone-prompt');
      showPrompt(phonePrompt, 'validation-warning', profile.phoneNote);
    } else {
      validatePhone();
    }
  }
}

function populateField(fieldId, value, showAutoFilled) {
  const input = document.getElementById(fieldId);
  if (input) {
    input.value = value || '';
    input.disabled = false;

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
  const phoneInput = document.getElementById('phone');
  phoneInput.addEventListener('blur', validatePhone);
  phoneInput.addEventListener('focus', () => {
    const prompt = document.getElementById('phone-prompt');
    if (!prompt.classList.contains('validation-warning') && !prompt.classList.contains('validation-error')) {
      showPrompt(prompt, 'hint', CONFIG.phone.messages.hint);
    }
  });

  const emailInput = document.getElementById('email');
  emailInput.addEventListener('blur', validateEmail);

  const addressInput = document.getElementById('address');
  addressInput.addEventListener('focus', () => {
    const prompt = document.getElementById('address-prompt');
    if (!prompt.classList.contains('validation-warning')) {
      showPrompt(prompt, 'hint', CONFIG.address.messages.hint);
    }
  });
  addressInput.addEventListener('blur', validateAddress);
}

function validateAddress() {
  const input = document.getElementById('address');
  const prompt = document.getElementById('address-prompt');
  const value = input.value.trim().toUpperCase();

  if (!value) return;

  // Check for abbreviations using config
  let foundAbbreviation = null;
  for (const abbr of CONFIG.address.abbreviations) {
    if (abbr.pattern.test(value)) {
      foundAbbreviation = abbr.display;
      break;
    }
  }

  const hasSingapore = CONFIG.address.singaporePattern.test(value);
  const hasPostal = CONFIG.address.postalPattern.test(value);

  if (foundAbbreviation) {
    showPrompt(prompt, 'validation-warning', CONFIG.address.messages.abbreviation(foundAbbreviation));
    input.classList.add('error');
  } else if (!hasSingapore && hasPostal) {
    showPrompt(prompt, 'validation-warning', CONFIG.address.messages.missingSingapore);
    input.classList.add('error');
  } else {
    showPrompt(prompt, 'soft-success', CONFIG.address.messages.valid);
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

  // Check against config rules
  if (value.startsWith('+' + CONFIG.phone.countryCode)) {
    errorMessage = CONFIG.phone.messages.countryCodePlus(value);
  } else if (value.startsWith(CONFIG.phone.countryCode)) {
    errorMessage = CONFIG.phone.messages.countryCode(value);
  } else if (value.length < CONFIG.phone.length) {
    errorMessage = CONFIG.phone.messages.tooShort(value.length);
  } else if (value.length > CONFIG.phone.length) {
    errorMessage = CONFIG.phone.messages.tooLong(value.length);
  } else if (!CONFIG.phone.validStartDigits.includes(value[0])) {
    errorMessage = CONFIG.phone.messages.wrongStart(value[0]);
  } else if (!/^\d+$/.test(value)) {
    errorMessage = CONFIG.phone.messages.nonDigits;
  } else {
    isValid = true;
  }

  const status = trackAttempt('phone', isValid, value);

  if (isValid) {
    showPrompt(prompt, 'soft-success', CONFIG.phone.messages.valid);
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

  let errorMessage = '';

  if (!value.includes('@')) {
    errorMessage = CONFIG.email.messages.missingAt(value);
  } else if (!value.includes('.')) {
    errorMessage = CONFIG.email.messages.missingDomain(value);
  } else if (value.indexOf('@') === 0) {
    errorMessage = CONFIG.email.messages.missingName;
  } else if (value.indexOf('@') === value.length - 1 || value.endsWith('@.')) {
    errorMessage = CONFIG.email.messages.incompleteDomain;
  }

  if (errorMessage) {
    showPrompt(prompt, 'validation-error', errorMessage);
    input.classList.add('error');
  } else {
    showPrompt(prompt, 'soft-success', CONFIG.email.messages.valid);
    input.classList.remove('error');
  }
}

// Photo upload
function initPhotoUpload() {
  const uploadArea = document.getElementById('photo-upload');
  const fileInput = document.getElementById('photo-file');
  const prompt = document.getElementById('photo-prompt');

  uploadArea.addEventListener('click', () => fileInput.click());

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

  uploadArea.addEventListener('mouseenter', () => {
    showPrompt(prompt, 'hint', 'Requirements: Recent colour photo, white background, 400x514 pixels minimum, JPEG format');
  });
}

function handlePhotoUpload(file) {
  const prompt = document.getElementById('photo-prompt');
  const uploadText = document.querySelector('.photo-upload-text');

  if (!file.type.startsWith('image/')) {
    showPrompt(prompt, 'validation-error', 'Please upload an image file (JPEG or PNG)');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showPrompt(prompt, 'validation-error', 'File is too large. Maximum size is 2MB.');
    return;
  }

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
    const errors = validateAllFields();

    if (errors.length > 0) {
      alert('Please fix the following issues:\n\n' + errors.join('\n'));
      return;
    }

    populateSummary();
    modal.classList.add('visible');
  });

  confirmBtn.addEventListener('click', () => {
    modal.classList.remove('visible');
    alert(CONFIG.submission.messages.success);
  });

  cancelBtn.addEventListener('click', () => modal.classList.remove('visible'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('visible');
  });
}

function validateAllFields() {
  const errors = [];
  const msgs = CONFIG.submission.messages.errors;

  const nric = document.getElementById('nric').value.trim();
  if (!nric || !isValidNricFormat(nric)) errors.push(msgs.nric);

  const name = document.getElementById('name').value.trim();
  if (!name) errors.push(msgs.name);

  const phone = document.getElementById('phone').value.trim();
  if (!phone || !CONFIG.phone.pattern.test(phone)) errors.push(msgs.phone);

  const email = document.getElementById('email').value.trim();
  if (!email || !CONFIG.email.pattern.test(email)) errors.push(msgs.email);

  const reason = document.getElementById('reason').value;
  if (!reason) errors.push(msgs.reason);

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
  element.classList.remove('pull', 'hint', 'validation-warning', 'validation-error', 'validation-success', 'soft-success');
  element.classList.add(type);
  if (message) element.textContent = message;
  element.classList.add('visible');
}

function hidePrompt(element) {
  if (element) element.classList.remove('visible');
}

function resetForm() {
  const inputs = document.querySelectorAll('#form-sections input:not([type="file"]), #form-sections select:not(#profile-select)');
  inputs.forEach(input => {
    input.value = '';
    input.disabled = false;
    input.classList.remove('error');
  });

  document.querySelectorAll('.auto-filled').forEach(el => el.remove());
  document.querySelectorAll('.prompt').forEach(el => el.classList.remove('visible'));

  const uploadText = document.querySelector('.photo-upload-text');
  if (uploadText) {
    uploadText.innerHTML = '<strong>Click to upload</strong> or drag and drop<br>JPEG or PNG, max 2MB';
  }

  // Reset attempt tracking
  Object.keys(fieldAttempts).forEach(key => delete fieldAttempts[key]);
}
