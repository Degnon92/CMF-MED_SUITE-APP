import re
from collections import Counter

def check_html():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    ids = re.findall(r'id=["\']([^"\']+)["\']', content)
    counter = Counter(ids)
    dups = {k: v for k, v in counter.items() if v > 1}
    print("Duplicate IDs found:", dups)

if __name__ == '__main__':
    check_html()
