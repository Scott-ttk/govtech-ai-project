// Synthetic profiles for demo switching
// All data is fictional and for prototype testing only

const PROFILES = {
  complete: {
    id: 'complete',
    label: 'Profile A: Complete & correct',
    nric: 'S1234567A',
    name: 'TAN AH KOW',
    dob: '1985-03-15',
    gender: 'Male',
    race: 'Chinese',
    address: 'BLK 123 BISHAN STREET 12 #04-567 SINGAPORE 570123',
    phone: '91234567',
    email: 'ahkow.tan@email.com'
  },
  outdatedAddress: {
    id: 'outdatedAddress',
    label: 'Profile B: Outdated address',
    nric: 'S2345678B',
    name: 'LIM MEI LING',
    dob: '1990-08-22',
    gender: 'Female',
    race: 'Chinese',
    address: 'BLK 45 TOA PAYOH LORONG 5 #12-345 SINGAPORE 310045',
    phone: '82345678',
    email: 'meiling.lim@email.com',
    addressNote: 'Address on record may be outdated. Please verify.'
  },
  wrongFormat: {
    id: 'wrongFormat',
    label: 'Profile C: Format errors',
    nric: 'S3456789C',
    name: 'MOHAMED IBRAHIM BIN HASSAN',
    dob: '1978-11-30',
    gender: 'Male',
    race: 'Malay',
    address: 'BLK 789 TAMPINES STREET 81 #08-123 SINGAPORE 520789',
    phone: '6591234567', // Wrong format - includes country code
    email: 'ibrahim.hassan@email.com'
  }
};

let currentProfile = null;

function loadProfile(profileId) {
  currentProfile = PROFILES[profileId];
  return currentProfile;
}

function getProfiles() {
  return Object.values(PROFILES).map(p => ({ id: p.id, label: p.label }));
}
