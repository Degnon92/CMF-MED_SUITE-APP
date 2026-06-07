import json

output = []
files = ['patients_db.json', 'bills_db.json', 'documents_db.json']
search_terms = ['hounkponu', 'arissou', 'adjassa', 'paraiso', 'nom...']

for db_file in files:
    try:
        with open(db_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        output.append(f"\n======================================")
        output.append(f"Checking {db_file}")
        output.append(f"======================================")
        
        if isinstance(data, list):
            items = data
        elif isinstance(data, dict):
            items = []
            for k, v in data.items():
                if isinstance(v, list):
                    items.extend(v)
                else:
                    items.append(v)
        else:
            items = [data]

        match_count = 0
        for item in items:
            text_rep = json.dumps(item, ensure_ascii=False).lower()
            if any(term in text_rep for term in search_terms):
                match_count += 1
                output.append(f"Match {match_count}:")
                output.append(json.dumps(item, indent=2, ensure_ascii=False))
                output.append("-" * 30)
                
        output.append(f"Total matches in {db_file}: {match_count}")
    except Exception as e:
        output.append(f"Error reading {db_file}: {e}")

with open("scratch/troublesome_results.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output))

print("Done writing to scratch/troublesome_results.txt")
