import requests

r = requests.get('https://e-cmis-a4.vercel.app/assets/ecmis.js')
with open('ecmis.js', 'w', encoding='utf-8') as f:
    f.write(r.text)
print('Downloaded ecmis.js, len=', len(r.text))
