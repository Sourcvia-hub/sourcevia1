#!/bin/bash

# Production Backend Testing Commands
# Backend URL: https://sourcevia-mgmt.emergent.host

echo "=================================="
echo "PRODUCTION BACKEND TESTS"
echo "Backend: https://sourcevia-mgmt.emergent.host"
echo "=================================="

BACKEND_URL="https://sourcevia-mgmt.emergent.host"

echo -e "\n=== Test 1: Root Endpoint ==="
curl -s $BACKEND_URL/ | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin), indent=2))"

echo -e "\n=== Test 2: Health Check (root level) ==="
curl -s $BACKEND_URL/health | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin), indent=2))"

echo -e "\n=== Test 3: Health Check (/api prefix) ==="
curl -s $BACKEND_URL/api/health | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin), indent=2))"

echo -e "\n=== Test 4: Login Endpoint (should return 401 for invalid creds) ==="
curl -s -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' \
  | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin), indent=2))"

echo -e "\n=== Test 5: CORS Headers ==="
curl -s -X OPTIONS $BACKEND_URL/api/auth/login \
  -H "Origin: https://sourcevia.xyz" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v 2>&1 | grep -i "access-control"

echo -e "\n=== Test 6: API Documentation ==="
echo "Open in browser: $BACKEND_URL/docs"
echo "Expected: FastAPI Swagger UI should load"

echo -e "\n=================================="
echo "All tests complete!"
echo "=================================="
