# Testing with cURL

## 1. Get Blockchain Information
```bash
curl -X GET http://localhost:3000/api/status
```

## 2. Get/{index} block
```bash
curl -X GET http://localhost:3000/api/block/1
```

## 3. Get/{hash} block
```bash
curl -X GET http://localhost:3000/api/block/ec3399ce8afbad08d19032d72ab256688990eb7a2f0e267dccf9072ff704c046
```

## 4. Add a New Block
```bash
curl -X POST http://localhost:3000/api/block \
-H "Content-Type: application/json" \
-d '{"index":1,"previousHash":"{{PREVIOUS HASH}}","data":"data1"}'
```