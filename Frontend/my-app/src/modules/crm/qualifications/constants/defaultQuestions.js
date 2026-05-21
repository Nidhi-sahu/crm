export const DEFAULT_QUALIFICATION_QUESTIONS = [
  { id: 'budget',        text: 'Budget finalized?',          type: 'radio',  options: ['Yes', 'No', 'Not sure'] },
  { id: 'budgetRange',   text: 'What is the client budget?', type: 'select', options: ['Below ₹10 Lakh', '₹10–20 Lakh', '₹20–30 Lakh', '₹30–50 Lakh', '₹50 Lakh–1 Cr', 'Above ₹1 Cr'] },
  { id: 'visit',         text: 'Site visit interested?',     type: 'radio',  options: ['Yes', 'No'] },
  { id: 'loan',          text: 'Loan required?',             type: 'radio',  options: ['Yes', 'No'] },
  { id: 'timeline',      text: 'Buying timeline?',           type: 'select', options: ['<1 month', '1-3 months', '3-6 months', '6+ months'] },
  { id: 'decisionMaker', text: 'Decision maker available?',  type: 'radio',  options: ['Yes', 'No'] },
  { id: 'purpose',       text: 'Investment or self-use?',    type: 'radio',  options: ['Investment', 'Self-use'] },
  { id: 'location',      text: 'Preferred location?',        type: 'text' },
  { id: 'family',        text: 'Family discussion pending?', type: 'radio',  options: ['Yes', 'No'] },
];

export const QUESTIONS_CONFIG_KEY = 'qualification.questions';
