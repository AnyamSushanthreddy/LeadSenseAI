/**
 * LeadSense-AI Intelligent Scoring Engine
 * Computes 4-dimensional lead intelligence:
 * 1. Intent (0-100)
 * 2. Affordability (0-100)
 * 3. Location Fit (0-100)
 * 4. Readiness (0-100)
 * + AI Predicted SLV Project Matching
 */

/**
 * AI SLV Project Match Predictor
 * Predicts the optimal SLV Project based on 4 key factors:
 * 1. Annual Income (₹)
 * 2. Max Investment Budget (₹)
 * 3. Credit Score (300-850)
 * 4. Bank Pre-Approval / Loan Status
 * + Properties Viewed & Site Visits
 */
export function predictMatchedSLVProject(lead) {
  if (!lead) return 'SLV Lorven (Gachibowli)';

  const budget = Number(lead.budget) || 0;
  const income = Number(lead.annualIncome) || 0;
  const credit = Number(lead.creditScore) || 650;
  const preapproved = (lead.loanPreapproved || '').toLowerCase() === 'yes';
  const siteVisits = Number(lead.siteVisits) || 0;
  const views = Number(lead.propertiesViewed) || 0;

  let score = 0;
  if (budget >= 30000000) score += 35;
  else if (budget >= 20000000) score += 28;
  else if (budget >= 15000000) score += 20;
  else if (budget >= 11000000) score += 14;
  else if (budget >= 8000000) score += 8;
  else score += 3;

  if (income >= 5000000) score += 25;
  else if (income >= 3500000) score += 18;
  else if (income >= 2500000) score += 12;
  else if (income >= 1500000) score += 8;

  if (credit >= 780) score += 15;
  else if (credit >= 720) score += 10;
  else if (credit >= 680) score += 5;

  if (preapproved) score += 12;
  if (siteVisits >= 2) score += 8;
  if (views >= 10) score += 5;

  if (score >= 80) return 'SLV Signature Villas (Jubilee Hills)';
  if (score >= 62) return 'SLV Prime Heights (Financial District)';
  if (score >= 46) return 'SLV Paradise (HITECH City)';
  if (score >= 30) return 'SLV Lorven (Gachibowli)';
  if (score >= 18) return 'SLV Residency (Kondapur)';
  return 'SLV Green Meadows (Tellapur)';
}

export function calculateLeadIntelligence(lead) {
  if (!lead) return {
    intentScore: 50,
    affordabilityScore: 50,
    locationFitScore: 50,
    readinessScore: 50,
    leadScore: 50,
    priority: 'Medium',
    conversionProbability: '50%',
    conversionProbabilityVal: 50,
    recommendedNextAction: 'Contact Lead',
    predictedProject: 'SLV Lorven (Gachibowli)'
  };

  // Predict matched SLV project
  const predictedProject = predictMatchedSLVProject(lead);

  // 1. Intent Score Calculation
  const viewed = Math.min(lead.propertiesViewed || 0, 30); // max 30
  const saved = Math.min(lead.savedListings || 0, 15); // max 15
  const inq = Math.min(lead.inquiries || 0, 10); // max 10
  const visits = Math.min(lead.siteVisits || 0, 5); // max 5
  const daysInactive = lead.daysSinceLastActivity || 0;

  let rawIntent = (viewed / 30 * 25) + (saved / 15 * 25) + (inq / 10 * 20) + (visits / 5 * 30);
  if (daysInactive > 14) rawIntent *= 0.7;
  else if (daysInactive > 7) rawIntent *= 0.85;
  const intentScore = Math.min(100, Math.max(10, Math.round(rawIntent)));

  // 2. Affordability Score Calculation
  const income = lead.annualIncome || 0;
  const budget = lead.budget || 0;
  const price = lead.propertyPrice || budget || 1;
  const credit = lead.creditScore || 650;
  const preapproved = (lead.loanPreapproved || '').toLowerCase() === 'yes';

  const budgetToPriceRatio = price > 0 ? (budget / price) : 1;
  let budgetScore = Math.min(100, budgetToPriceRatio * 75);
  const creditFactor = Math.min(100, Math.max(0, ((credit - 550) / 300) * 100));

  let rawAffordability = (budgetScore * 0.45) + (creditFactor * 0.35) + (preapproved ? 20 : 5);
  const affordabilityScore = Math.min(100, Math.max(15, Math.round(rawAffordability)));

  // 3. Location Fit Score Calculation
  const primeLocations = ['Gachibowli', 'HITECH City', 'Jubilee Hills', 'Banjara Hills', 'Financial District', 'Kondapur', 'Tellapur', 'Manikonda'];
  const isPrime = primeLocations.includes(lead.preferredLocation);
  let rawLocation = isPrime ? 85 : 70;
  if (lead.propertyType === 'Villa' || lead.propertyType === 'Penthouse') rawLocation += 10;
  const locationFitScore = Math.min(100, Math.max(20, Math.round(rawLocation)));

  // 4. Readiness Score Calculation
  const timelineScores = {
    'Immediate': 95,
    '1-3 Months': 80,
    '3-6 Months': 55,
    '6+ Months': 35
  };
  const stageScores = {
    'Closing': 98,
    'Negotiation': 88,
    'In Discussion': 72,
    'Site Visit Scheduled': 65,
    'New': 40
  };

  const tScore = timelineScores[lead.moveInTimeline] || 50;
  const sScore = stageScores[lead.transactionStage] || 50;
  let rawReadiness = (tScore * 0.55) + (sScore * 0.45);
  const readinessScore = Math.min(100, Math.max(10, Math.round(rawReadiness)));

  // 5. Aggregate Lead Score (Weighted average)
  const leadScore = Math.min(100, Math.max(5, Math.round(
    (intentScore * 0.30) +
    (affordabilityScore * 0.25) +
    (locationFitScore * 0.20) +
    (readinessScore * 0.25)
  )));

  // Priority Label
  let priority = 'Low';
  if (leadScore >= 75) priority = 'High';
  else if (leadScore >= 50) priority = 'Medium';

  // Conversion Probability (%)
  const conversionProbabilityVal = Math.min(98, Math.max(8, Math.round(leadScore * 0.95 + (preapproved ? 4 : 0))));
  const conversionProbability = `${conversionProbabilityVal}%`;

  // AI Rationale & Explanation
  const explanations = [];
  if (intentScore >= 75) explanations.push(`High engagement: viewed ${lead.propertiesViewed || 0} properties & attended ${lead.siteVisits || 0} site visits.`);
  else if (intentScore < 45) explanations.push(`Low activity: inactive for ${daysInactive} days with only ${lead.inquiries || 0} inquiries.`);

  if (preapproved) explanations.push(`Financial readiness verified with pre-approved loan & credit score of ${lead.creditScore}.`);
  else if (lead.creditScore < 680) explanations.push(`Pending loan pre-approval; credit score is ${lead.creditScore}.`);

  if (lead.moveInTimeline === 'Immediate') explanations.push(`Urgent purchase intent with an immediate move-in timeline.`);
  if (affordabilityScore >= 80) explanations.push(`Strong budget capacity (₹${((lead.budget || 0) / 100000).toFixed(1)}L) comfortably aligns with property price.`);

  const aiExplanation = explanations.join(' ') || `Lead exhibits steady interaction for ${lead.propertyType || 'Apartment'} in ${lead.preferredLocation || 'Gachibowli'}.`;

  // Recommended Next Action
  let recommendedNextAction = 'Schedule Follow-up';
  let actionCategory = 'Follow-up';

  if (priority === 'High' && lead.siteVisits >= 2 && lead.transactionStage !== 'Closing') {
    recommendedNextAction = 'Call Immediately - Prepare Closing Offer';
    actionCategory = 'Call';
  } else if (preapproved && priority === 'High') {
    recommendedNextAction = 'Send VIP Site Visit Invitation';
    actionCategory = 'Visit';
  } else if (daysInactive > 10) {
    recommendedNextAction = 'Re-engagement Email & WhatsApp Brochure';
    actionCategory = 'Email';
  }

  return {
    intentScore,
    affordabilityScore,
    locationFitScore,
    readinessScore,
    leadScore,
    priority,
    conversionProbability,
    conversionProbabilityVal,
    aiExplanation,
    recommendedNextAction,
    actionCategory,
    predictedProject,
    slvProject: lead.slvProject || predictedProject
  };
}

export function formatINR(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}
