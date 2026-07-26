/**
 * LeadSense-AI Intelligent Scoring Engine
 * Computes 4-dimensional lead intelligence:
 * 1. Intent (0-100)
 * 2. Affordability (0-100)
 * 3. Location Fit (0-100)
 * 4. Readiness (0-100)
 */

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
    recommendedNextAction: 'Contact Lead'
  };
  // 1. Intent Score Calculation
  const viewed = Math.min(lead.propertiesViewed || 0, 30); // max 30
  const saved = Math.min(lead.savedListings || 0, 15); // max 15
  const inq = Math.min(lead.inquiries || 0, 10); // max 10
  const visits = Math.min(lead.siteVisits || 0, 5); // max 5
  const daysInactive = lead.daysSinceLastActivity || 0;

  let rawIntent = (viewed / 30 * 25) + (saved / 15 * 25) + (inq / 10 * 20) + (visits / 5 * 30);
  // Recency penalty
  if (daysInactive > 14) rawIntent *= 0.7;
  else if (daysInactive > 7) rawIntent *= 0.85;
  const intentScore = Math.min(100, Math.max(10, Math.round(rawIntent)));

  // 2. Affordability Score Calculation
  const income = lead.annualIncome || 0;
  const budget = lead.budget || 0;
  const price = lead.propertyPrice || budget || 1;
  const credit = lead.creditScore || 650;
  const preapproved = (lead.loanPreapproved || '').toLowerCase() === 'yes';

  // Income to price ratio (Ideal: 3x-4x annual income relative to price or healthy loan capacity)
  const budgetToPriceRatio = price > 0 ? (budget / price) : 1;
  let budgetScore = Math.min(100, budgetToPriceRatio * 75);

  // Credit score factor (300-850)
  const creditFactor = Math.min(100, Math.max(0, ((credit - 550) / 300) * 100));

  let rawAffordability = (budgetScore * 0.45) + (creditFactor * 0.35) + (preapproved ? 20 : 5);
  const affordabilityScore = Math.min(100, Math.max(15, Math.round(rawAffordability)));

  // 3. Location Fit Score Calculation
  // Hyderabad key hubs have distinct affinity values
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
    'New': 45
  };

  const timelineBase = timelineScores[lead.moveInTimeline] || 50;
  const stageBase = stageScores[lead.transactionStage] || 50;
  const loanBonus = preapproved ? 15 : 0;

  let rawReadiness = (timelineBase * 0.45) + (stageBase * 0.45) + loanBonus;
  const readinessScore = Math.min(100, Math.max(10, Math.round(rawReadiness)));

  // 5. Aggregate Lead Score (Weighted average)
  // Weights: Intent (30%), Affordability (25%), Location Fit (20%), Readiness (25%)
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
  if (intentScore >= 75) explanations.push(`High engagement: viewed ${lead.propertiesViewed} properties & attended ${lead.siteVisits} site visits.`);
  else if (intentScore < 45) explanations.push(`Low activity: inactive for ${daysInactive} days with only ${lead.inquiries} inquiries.`);

  if (preapproved) explanations.push(`Financial readiness verified with pre-approved loan & credit score of ${lead.creditScore}.`);
  else if (lead.creditScore < 680) explanations.push(`Pending loan pre-approval; credit score is ${lead.creditScore}.`);

  if (lead.moveInTimeline === 'Immediate') explanations.push(`Urgent purchase intent with an immediate move-in timeline.`);
  if (affordabilityScore >= 80) explanations.push(`Strong budget capacity (₹${(lead.budget / 100000).toFixed(1)}L) comfortably aligns with property price.`);

  const aiExplanation = explanations.join(' ') || `Lead exhibits steady interaction for ${lead.propertyType} in ${lead.preferredLocation}.`;

  // Recommended Next Action
  let recommendedNextAction = 'Schedule Follow-up';
  let actionCategory = 'Follow-up';

  if (priority === 'High' && lead.siteVisits >= 2 && lead.transactionStage !== 'Closing') {
    recommendedNextAction = 'Call Immediately - Prepare Closing Offer';
    actionCategory = 'Call';
  } else if (preapproved && priority === 'High') {
    recommendedNextAction = 'Schedule VIP Property Walkthrough';
    actionCategory = 'Schedule Visit';
  } else if (!preapproved && affordabilityScore >= 70) {
    recommendedNextAction = 'Connect with Preferred Lender for Pre-approval';
    actionCategory = 'Nurture';
  } else if (daysInactive > 10) {
    recommendedNextAction = 'Send Re-engagement Catalog & Price Drop Updates';
    actionCategory = 'Nurture';
  } else if (lead.transactionStage === 'New') {
    recommendedNextAction = 'Conduct Qualification Discovery Call';
    actionCategory = 'Call';
  } else {
    recommendedNextAction = 'Send Curated Listing Deck for ' + lead.preferredLocation;
    actionCategory = 'Follow-up';
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
    actionCategory
  };
}

/**
 * Format Indian Currency (INR) cleanly
 */
export function formatINR(val) {
  if (!val && val !== 0) return '₹0';
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  } else if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  } else {
    return `₹${val.toLocaleString('en-IN')}`;
  }
}
