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
  },
  // Test case: User has the info but entered it wrong — prompt should help
  confusedFormat: {
    id: 'confusedFormat',
    label: 'Profile D: Confused format (made up)',
    nric: 'S4567890D',
    name: 'WONG KAI MING',
    dob: '1992-05-18',
    gender: 'Male',
    race: 'Chinese',
    address: 'BLK 234 ANG MO KIO AVE 3 #15-678 SINGAPORE 560234',
    phone: '98761234',
    email: 'kaiming.wong@email.com',
    // Scenario: User knows their info but confused about format
    // The prompt "8-digit number starting with 8 or 9" helps them realise their input is correct
    testNote: 'Tests: User has correct info, prompt confirms format is right'
  },
  // Test case: User doesn't have the info — prompt won't help
  missingInfo: {
    id: 'missingInfo',
    label: 'Profile E: Missing info (made up)',
    nric: 'S5678901E',
    name: 'SARAH TAN WEI LING',
    dob: '1988-12-03',
    gender: 'Female',
    race: 'Chinese',
    address: 'BLK 567 JURONG WEST ST 52 #03-456 SINGAPORE 640567',
    phone: '', // User doesn't have a local number yet (just returned from overseas)
    email: 'sarah.tan@email.com',
    phoneNote: 'No local mobile number on record. Please enter your current number.',
    // Scenario: User needs to provide info they don't have readily available
    // Prompt explains what's needed but can't help them find it
    testNote: 'Tests: User lacks info — prompt explains but cannot solve the problem'
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
