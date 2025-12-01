#!/bin/bash

BACKEND="https://sourcevia-secure.emergent.host"
ORIGIN="https://sourcevia.xyz"

echo "==================================="
echo "Testing Production CORS"
echo "Backend: $BACKEND"
echo "Origin: $ORIGIN"
echo "==================================="

echo -e "\n1. Testing /api/health endpoint..."
curl -s $BACKEND/api/health | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin), indent=2))" 2>/dev/null || echo "Failed to connect or parse response"

echo -e "\n2. Testing CORS for /api/auth/me..."
echo "Expected: access-control-allow-origin: $ORIGIN"
echo "Actual:"
curl -s -X OPTIONS $BACKEND/api/auth/me \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  -v 2>&1 | grep "access-control-allow-origin" || echo "❌ No CORS header found"

echo -e "\n3. Testing CORS for /api/auth/login..."
echo "Expected: access-control-allow-origin: $ORIGIN"
echo "Actual:"
curl -s -X OPTIONS $BACKEND/api/auth/login \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -v 2>&1 | grep "access-control-allow-origin" || echo "❌ No CORS header found"

echo -e "\n4. Testing CORS for /api/auth/register..."
echo "Expected: access-control-allow-origin: $ORIGIN"
echo "Actual:"
curl -s -X OPTIONS $BACKEND/api/auth/register \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -v 2>&1 | grep "access-control-allow-origin" || echo "❌ No CORS header found"

echo -e "\n==================================="
echo "CORS Test Complete"
echo "==================================="
echo ""
echo "✅ If you see 'access-control-allow-origin: $ORIGIN' above,"
echo "   then CORS is working correctly!"
echo ""
echo "❌ If you see 'No CORS header found',"
echo "   then the backend needs to be deployed with the latest code."
echo "==================================="
