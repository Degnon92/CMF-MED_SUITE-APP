with open("documents.js", "r", encoding="utf-8") as f:
    text = f.read()

# Let's search for "rapport_cs_simple" and find where the text starts
import re
matches = re.findall(r"rapport_cs_simple:\s*\{.*?text:\s*`([^`]*)`", text, re.DOTALL)
if matches:
    print("--- rapport_cs_simple text starts with: ---")
    print(repr(matches[0][:150]))

matches_suivi = re.findall(r"rapport_cs_suivi:\s*\{.*?text:\s*`([^`]*)`", text, re.DOTALL)
if matches_suivi:
    print("--- rapport_cs_suivi text starts with: ---")
    print(repr(matches_suivi[0][:150]))

matches_assurance = re.findall(r"rapport_cs_assurance:\s*\{.*?text:\s*`([^`]*)`", text, re.DOTALL)
if matches_assurance:
    print("--- rapport_cs_assurance text starts with: ---")
    print(repr(matches_assurance[0][:150]))

matches_lca = re.findall(r"cro_lca:\s*\{.*?text:\s*`([^`]*)`", text, re.DOTALL)
if matches_lca:
    print("--- cro_lca text starts with: ---")
    print(repr(matches_lca[0][:150]))
