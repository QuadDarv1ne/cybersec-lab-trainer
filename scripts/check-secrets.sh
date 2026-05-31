#!/bin/bash
# Security check: ensure NEXTAUTH_SECRET is not using default/weak values

INSECURE_SECRETS=(
  "change-me-in-production"
  "change-me-generate-with-openssl-rand-base64-32"
  "cybersec"
  ""
)

SECRET="${NEXTAUTH_SECRET}"
FAILED=0

for insecure in "${INSECURE_SECRETS[@]}"; do
  if [ "$SECRET" = "$insecure" ]; then
    FAILED=1
    break
  fi
done

# Also check length - secret should be at least 32 chars
if [ ${#SECRET} -lt 32 ]; then
  FAILED=1
fi

if [ "$FAILED" -eq 1 ]; then
  echo "ERROR: NEXTAUTH_SECRET is missing or insecure!"
  echo ""
  echo "Generate a secure secret:"
  echo "  openssl rand -base64 32"
  echo ""
  echo "Or use the helper script:"
  echo "  node scripts/generate-secrets.mjs"
  echo ""
  echo "Set it in your .env file or environment variables."
  exit 1
fi

echo "NEXTAUTH_SECRET validation passed."
exec "$@"
