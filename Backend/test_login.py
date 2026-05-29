import http.client
import json

conn = http.client.HTTPConnection("localhost", 3000)
payload = json.dumps({
    "username": "maxmuster",
    "password": "Password1!"
})
headers = {
    'Content-Type': 'application/json'
}
conn.request("POST", "/user/login", payload, headers)
res = conn.getresponse()
data = res.read()
print(f"Status: {res.status}")
print(f"Response: {data.decode('utf-8')}")
