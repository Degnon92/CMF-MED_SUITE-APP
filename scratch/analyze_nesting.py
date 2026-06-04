import sys
from html.parser import HTMLParser

class NestingParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.found_main = False
        self.main_stack = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        self.stack.append((tag, attrs_dict))
        if tag == 'main' or (tag == 'div' and attrs_dict.get('class') == 'main-content'):
            self.found_main = True
            self.main_stack = list(self.stack)

    def handle_endtag(self, tag):
        if self.stack:
            self.stack.pop()

with open('../index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

parser = NestingParser()
parser.feed(html_content)

if parser.found_main:
    print("Stack path for <main>:")
    for tag, attrs in parser.main_stack:
        attrs_str = f" class='{attrs.get('class')}'" if attrs.get('class') else ""
        attrs_str += f" id='{attrs.get('id')}'" if attrs.get('id') else ""
        print(f"  <{tag}{attrs_str}>")
else:
    print("<main> not found or not parsed correctly")
