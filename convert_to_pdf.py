import markdown
from markdown.extensions.tables import TableExtension
from markdown.extensions.fenced_code import FencedCodeExtension

with open('COMPTE_RENDU.md', 'r', encoding='utf-8') as f:
    md_text = f.read()

html = markdown.markdown(md_text, extensions=[TableExtension(), FencedCodeExtension()])

html_full = f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body {{ font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; }}
h1 {{ color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }}
h2 {{ color: #34495e; margin-top: 30px; border-bottom: 2px solid #95a5a6; padding-bottom: 8px; }}
h3 {{ color: #555; margin-top: 20px; }}
code {{ background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }}
pre {{ background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto; }}
pre code {{ background: none; color: inherit; }}
table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
th {{ background: #3498db; color: white; }}
</style>
</head>
<body>
{html}
</body>
</html>'''

with open('COMPTE_RENDU.html', 'w', encoding='utf-8') as f:
    f.write(html_full)

print("✅ Fichier HTML généré : COMPTE_RENDU.html")
print("\n📄 Pour créer le PDF :")
print("1. Ouvre COMPTE_RENDU.html dans Safari ou Chrome")
print("2. Fichier > Imprimer (Cmd+P)")
print("3. Enregistrer en PDF")
