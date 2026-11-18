// Validation rules and prompt messages
// Extracted from hard-coded logic for maintainability
// All examples are synthetic

const CONFIG = {
  // Attempt tracking
  maxAttempts: 2,

  // Phone validation
  phone: {
    pattern: /^[89]\d{7}$/,
    length: 8,
    validStartDigits: ['8', '9'],
    countryCode: '65',
    messages: {
      hint: '8-digit number starting with 8 or 9 (e.g. 91234567)',
      countryCodePlus: (value) => `You entered "${value}". Remove the +65 country code — we only need the 8-digit number (e.g. 91234567).`,
      countryCode: (value) => `You entered "${value}". Remove the 65 country code — we only need the 8-digit number (e.g. 91234567).`,
      tooShort: (length) => `You entered ${length} digits. Singapore mobile numbers have exactly 8 digits starting with 8 or 9.`,
      tooLong: (length) => `You entered ${length} digits. Singapore mobile numbers have exactly 8 digits — no spaces or dashes.`,
      wrongStart: (digit) => `Your number starts with ${digit}. Singapore mobile numbers start with 8 or 9.`,
      nonDigits: 'Please enter digits only — no spaces, dashes or letters.',
      valid: 'Looks good'
    }
  },

  // Email validation
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      missingAt: (value) => `You entered "${value}". Email addresses need an @ symbol (e.g. name@email.com).`,
      missingDomain: (value) => `You entered "${value}". Email addresses need a domain like .com or .sg after the @.`,
      missingName: 'Email address needs your name before the @ symbol.',
      incompleteDomain: 'Email address needs a domain after the @ symbol (e.g. gmail.com).',
      valid: 'Looks good'
    }
  },

  // Address validation
  address: {
    abbreviations: [
      { pattern: /\bST\b/, replacement: 'STREET', display: 'ST → STREET' },
      { pattern: /\bAVE\b/, replacement: 'AVENUE', display: 'AVE → AVENUE' },
      { pattern: /\bRD\b/, replacement: 'ROAD', display: 'RD → ROAD' },
      { pattern: /\bDR\b/, replacement: 'DRIVE', display: 'DR → DRIVE' },
      { pattern: /\bS(\d{6})/, replacement: 'SINGAPORE $1', display: 'S → SINGAPORE before postal code' }
    ],
    postalPattern: /\d{6}/,
    singaporePattern: /SINGAPORE\s*\d{6}/,
    messages: {
      hint: 'Format: BLK [number] [street name] #[unit] SINGAPORE [postal]',
      abbreviation: (found) => `Please spell out "${found}". ICA requires full words, not abbreviations.`,
      missingSingapore: 'Add "SINGAPORE" before the postal code (e.g. SINGAPORE 570123, not just 570123).',
      valid: 'Looks good'
    }
  },

  // NRIC validation
  nric: {
    pattern: /^[STFG]\d{7}[A-Z]$/i,
    messages: {
      invalid: 'Please enter a valid NRIC (e.g. S1234567A)',
      hint: 'Enter your NRIC and click the button to retrieve your registered details'
    }
  },

  // Help escalation
  help: {
    message: (fieldId) => `<br><br><strong>Need help?</strong> <a href="#" class="help-link" data-field="${fieldId}">Speak to an officer</a> or call 6391 6100.`,
    modalMessage: (fieldId) => `[Prototype] This would open a chat with an ICA officer about the "${fieldId}" field.\n\nThe application has been flagged for follow-up.`
  },

  // Singpass pull
  singpass: {
    messages: {
      success: 'Details retrieved from government records. Please verify and update if needed.',
      loading: 'Retrieving...',
      buttonText: 'Retrieve via Singpass'
    }
  },

  // Form submission
  submission: {
    messages: {
      success: 'Application submitted successfully!\n\n(This is a prototype - no actual submission occurred)',
      errors: {
        nric: '- Please enter a valid NRIC',
        name: '- Name is required',
        phone: '- Please enter a valid 8-digit phone number',
        email: '- Please enter a valid email address',
        reason: '- Please select a reason for application'
      }
    }
  }
};
