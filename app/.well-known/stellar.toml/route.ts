export async function GET() {
  const toml = `
VERSION="2.0.0"

NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

ORG_NAME="RemitWise"
ORG_URL="https://remitwise.app"
ORG_DESCRIPTION="Stellar-based cross-border remittance platform"

DOCUMENTATION="https://remitwise.app/docs"

SIGNING_KEY="REPLACE_WITH_PROJECT_PUBLIC_KEY"

WEB_AUTH_ENDPOINT="https://remitwise.app/api/auth"

TRANSFER_SERVER="https://remitwise.app/api/anchor"
`;

  return new Response(toml.trim(), {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}