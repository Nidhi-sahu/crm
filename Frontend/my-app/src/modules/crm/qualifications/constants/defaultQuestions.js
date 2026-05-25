export const DEFAULT_QUALIFICATION_QUESTIONS = [
  { id: 'budget',        text: 'Budget finalized?',          type: 'radio',  options: ['Yes', 'No', 'Not sure'] },
  { id: 'budgetRange',   text: 'What is the client budget?', type: 'select', options: ['Below ₹10 Lakh', '₹10–20 Lakh', '₹20–30 Lakh', '₹30–50 Lakh', '₹50 Lakh–1 Cr', 'Above ₹1 Cr'] },
  { id: 'loan',          text: 'Loan required?',             type: 'radio',  options: ['Yes', 'No'] },
  { id: 'timeline',      text: 'Buying timeline?',           type: 'select', options: ['<1 month', '1-3 months', '3-6 months', '6+ months'] },
  { id: 'lookingFor',    text: 'Looking For:',               type: 'radio',  options: ['Self', 'Family Member'] },
  { id: 'purpose',       text: 'Investment or self-use?',    type: 'radio',  options: ['Investment', 'Self-use'] },
  { id: 'location',      text: 'Preferred location?',        type: 'text' },
];

export const QUESTIONS_CONFIG_KEY = 'qualification.questions';
