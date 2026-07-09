// All 36 states + FCT. Built to scale nationwide from day one,
// even though the demo only carries real listings in a few states.
export const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

// States that carry real demo listings today. Used to nudge the
// browser toward populated states so a cold demo never looks empty.
export const ACTIVE_STATES = ['Lagos', 'FCT - Abuja', 'Enugu', 'Delta']

export const PROPERTY_TYPES = [
  'Self-contained',
  'Mini flat (Room & Parlour)',
  '1-bedroom flat',
  '2-bedroom flat',
  '3-bedroom flat',
  'Duplex',
  'Bungalow',
  'Shop / Commercial',
  'Land',
]

// Launch markets (four cities live at launch).
export const LAUNCH_MARKETS = ['FCT - Abuja', 'Lagos', 'Enugu', 'Delta']

export const DEAL_TYPES = [
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
  { key: 'land', label: 'Land' },
]
