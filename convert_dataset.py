import pandas as pd
import json
import os
import random

excel_path = 'd:/LeadSenseAI/dataset/LeadSenseAI_Hyderabad_Leads_Dataset_INR.xlsx'
df = pd.read_excel(excel_path)

leads = []
avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
]

for idx, row in df.iterrows():
    name = str(row['Full_Name'])
    first = name.split()[0].lower()
    last = name.split()[-1].lower() if len(name.split()) > 1 else 'lead'
    email = f"{first}.{last}@gmail.com"
    phone = f"+91 98{random.randint(10000000, 99999999)}"
    
    lead_type = "Buyer" if row['Budget (₹)'] > 4000000 else "Tenant"

    lead_obj = {
        "id": str(row['Lead_ID']),
        "name": name,
        "type": lead_type,
        "avatar": avatars[idx % len(avatars)],
        "email": email,
        "phone": phone,
        "age": int(row['Age']),
        "occupation": str(row['Occupation']),
        "annualIncome": float(row['Annual_Income (₹)']),
        "creditScore": int(row['Credit_Score']),
        "budget": float(row['Budget (₹)']),
        "preferredLocation": str(row['Preferred_Location']),
        "propertyType": str(row['Property_Type']),
        "propertyPrice": float(row['Property_Price (₹)']),
        "propertiesViewed": int(row['Properties_Viewed']),
        "savedListings": int(row['Saved_Listings']),
        "inquiries": int(row['Inquiries']),
        "siteVisits": int(row['Site_Visits']),
        "loanPreapproved": str(row['Loan_Preapproved']),
        "moveInTimeline": str(row['Move_In_Timeline']),
        "transactionStage": str(row['Transaction_Stage']),
        "leadSource": str(row['Lead_Source']),
        "daysSinceLastActivity": int(row['Days_Since_Last_Activity']),
        "intentScore": int(row['Intent_Score']),
        "affordabilityScore": int(row['Affordability_Score']),
        "locationFitScore": int(row['Location_Fit_Score']),
        "readinessScore": int(row['Readiness_Score']),
        "leadScore": int(row['Lead_Score']),
        "priority": str(row['Priority']),
        "conversionProbability": str(row['Conversion_Probability']),
        "notes": f"Interested in {row['Property_Type']} in {row['Preferred_Location']}. Income: ₹{int(row['Annual_Income (₹)']):,}, Timeline: {row['Move_In_Timeline']}."
    }
    leads.append(lead_obj)

os.makedirs('d:/LeadSenseAI/src/data', exist_ok=True)
with open('d:/LeadSenseAI/src/data/leadsData.json', 'w', encoding='utf-8') as f:
    json.dump(leads, f, indent=2, ensure_ascii=False)

print(f"Successfully exported {len(leads)} leads to src/data/leadsData.json")
