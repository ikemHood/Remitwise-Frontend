export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieHeader =
    'remitwise_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieHeader,
    },
  });
}
