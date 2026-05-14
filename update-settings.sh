#!/bin/bash
LOGIN=$(curl -s -X POST http://127.0.0.1:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"Stark@2026!Adm"}')
TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Using token..."

curl -s -X PUT http://127.0.0.1:3001/api/settings \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"phone":"0769-22763199","mobile":"(+86) 18520151000","email":"zora@stark-water.com","address":"Building C, Longchuang Micro-Chuangyuan, #26 Hantang Street, Dongcheng District, Dongguan City. China.","company_name":"STARK Environmental Solutions Ltd","company_slogan":"Professional Stainless Steel Water Treatment Solutions","company_brief":"STARK Environmental Solutions Ltd is an environmentally friendly enterprise that focuses on providing water treatment stainless steel products. It is engaged in the research and development, production, sales and after-sales service of environmentally friendly water purification stainless steel products. The main stainless steel water treatment products produced and operated are: mechanical filters, sterile water tanks, insulated water tanks, activated carbon filters, security filters, bag filters, mixing tanks, etc. The products are widely used in electronics, electroplating, power plants, medicine, petroleum, chemical industry, food and beverage, printing and dyeing and other industries.","facebook_url":"https://www.facebook.com/zora.jiang.79","linkedin_url":"https://www.linkedin.com/in/zora-jiang-b419a420b/","youtube_url":"https://www.youtube.com/channel/UCrZvtAxTggHk2f49WTBTlPw"}'
