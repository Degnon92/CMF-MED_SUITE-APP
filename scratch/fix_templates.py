import os

file_path = "documents.js"

if not os.path.exists(file_path):
    print("documents.js not found.")
    exit(1)

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's normalize to \n first for easier regex/replacements, then write back with original line endings
has_crlf = "\r\n" in content
normalized = content.replace("\r\n", "\n")

replacements = [
    # 1. rapport_cs_simple
    (
        "Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}\nAGE : {{PATIENT_AGE}}\n\nRAPPORT DE CONSULTATION\n\nJe soussigné",
        "Je soussigné"
    ),
    # 2. rapport_cs_suivi
    (
        "Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}\nAGE : {{PATIENT_AGE}}\n\nRAPPORT DE CONSULTATION\n\nJe soussigné",
        "Je soussigné"
    ),
    # 3. rapport_cs_assurance
    (
        "Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}\nAGE : {{PATIENT_AGE}}\n\nRAPPORT DE CONSULTATION\n\nJe soussigné",
        "Je soussigné"
    ),
    # 4. rapport_hospi_simple
    (
        "Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}\nAGE : {{PATIENT_AGE}}\n\nRAPPORT D'HOSPITALISATION\n\nJe, soussigné",
        "Je, soussigné"
    ),
    # 5. rapport_hospi_assurance
    (
        "Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}\nAGE : {{PATIENT_AGE}}\n\nRAPPORT D'HOSPITALISATION\n\nJe, soussigné",
        "Je, soussigné"
    ),
    # 6. rapport_hospi_prolongation
    (
        "Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}\nAGE : {{PATIENT_AGE}}\n\nRAPPORT DE PROLONGATION DE PRISE EN CHARGE\n\nJe soussigné",
        "Je soussigné"
    ),
    # 7. rapport_medical
    (
        "Patient : {{PATIENT_NOM}} {{PATIENT_PRENOM}}\nAGE : {{PATIENT_AGE}}\n\nRAPPORT MÉDICAL\n\nJe soussigné",
        "Je soussigné"
    ),
    # 8. cro_lca
    (
        "PATIENT : {{PATIENT_NOM}} {{PATIENT_PRENOM}}\nAGE : {{PATIENT_AGE}}\nDATE D'INTERVENTION",
        "DATE D'INTERVENTION"
    ),
    # 9. cro_cmf
    (
        "PATIENT : {{PATIENT_NOM}} {{PATIENT_PRENOM}}\nAGE : {{PATIENT_AGE}}\nDATE D'INTERVENTION",
        "DATE D'INTERVENTION"
    ),
]

applied_count = 0
for target, replacement in replacements:
    if target in normalized:
        normalized = normalized.replace(target, replacement)
        applied_count += 1
    else:
        print(f"Warning: Target text not found for a replacement:\n{target[:60]}...")

# Restore line endings
if has_crlf:
    final_content = normalized.replace("\n", "\r\n")
else:
    final_content = normalized

with open(file_path, "w", encoding="utf-8") as f:
    f.write(final_content)

print(f"Applied {applied_count} / {len(replacements)} replacements successfully.")
