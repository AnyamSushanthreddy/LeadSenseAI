import json
import random

json_path = 'd:/LeadSenseAI/src/data/leadsData.json'
with open(json_path, 'r', encoding='utf-8') as f:
    leads = json.load(f)

slv_projects = [
    "SLV Lorven (Gachibowli)",
    "SLV Paradise (HITECH City)",
    "SLV Residency (Kondapur)",
    "SLV Green Meadows (Tellapur)",
    "SLV Prime Heights (Financial District)",
    "SLV Signature Villas (Jubilee Hills)"
]

for idx, lead in enumerate(leads):
    # Assign an SLV project match
    lead['slvProject'] = slv_projects[idx % len(slv_projects)]
    lead['slvWebsiteUrl'] = "https://sites.google.com/view/slvbuildersanddevelopers/home?pli=1"
    # Ensure realistic password & customer login details
    lead['password'] = "password123"

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(leads, f, indent=2, ensure_ascii=False)

print(f"Successfully enriched {len(leads)} leads with SLV Builders & Developers projects & login credentials.")
