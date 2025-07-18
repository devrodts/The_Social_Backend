#!/bin/bash

# GraphQL Endpoint Testing Script
BASE_URL="http://localhost:3000/graphql"

echo "Starting GraphQL API Endpoint Tests..."
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local test_name="$1"
    local query="$2"
    echo -e "${BLUE}Testing: $test_name${NC}"
    echo "Query: $query"
    
    response=$(curl -s -X POST "$BASE_URL" \
        -H "Content-Type: application/json" \
        -d "$query")
    
    if echo "$response" | grep -q '"errors"'; then
        echo -e "${RED}❌ FAILED${NC}"
        echo "Response: $response"
    else
        echo -e "${GREEN}✅ SUCCESS${NC}"
        echo "Response: $response"
    fi
    echo "---"
}

# 1. AUTH TESTS
echo -e "${BLUE}=== AUTH MODULE TESTS ===${NC}"

# Test 1: Register
test_endpoint "Register User" '{
  "query": "mutation Register($input: RegisterInputDTO!) { register(input: $input) { token refreshToken user { id username email displayName } } }",
  "variables": {
    "input": {
      "username": "johndoe",
      "email": "john@example.com",
      "password": "password123",
      "displayName": "John Doe"
    }
  }
}'

# Test 2: Login
test_endpoint "Login User" '{
  "query": "mutation Login($input: LoginDTO!) { login(input: $input) { token refreshToken user { id username email displayName } } }",
  "variables": {
    "input": {
      "email": "john@example.com",
      "password": "password123"
    }
  }
}'

# Get token for protected endpoints
echo "Getting auth token..."
TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "mutation Login($input: LoginDTO!) { login(input: $input) { token refreshToken user { id username email displayName } } }",
      "variables": {
        "input": {
          "email": "john@example.com",
          "password": "password123"
        }
      }
    }')

# Extract token
TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo "$TOKEN_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"
echo "User ID: $USER_ID"

# Test 3: Refresh Token
test_endpoint "Refresh Token" '{
  "query": "mutation RefreshToken($input: RefreshTokenDTO!) { refreshToken(input: $input) { token refreshToken user { id username email displayName } } }",
  "variables": {
    "input": {
      "refreshToken": "'$REFRESH_TOKEN'"
    }
  }
}'

# Test 4: Me Query (Protected)
echo -e "${BLUE}Testing: Me Query (Protected)${NC}"
response=$(curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "query": "query { me { id username email displayName bio avatar followersCount followingCount tweetsCount createdAt updatedAt } }"
    }')

if echo "$response" | grep -q '"errors"'; then
    echo -e "${RED}❌ FAILED${NC}"
    echo "Response: $response"
else
    echo -e "${GREEN}✅ SUCCESS${NC}"
    echo "Response: $response"
fi
echo "---"

echo "Auth tests completed!" 