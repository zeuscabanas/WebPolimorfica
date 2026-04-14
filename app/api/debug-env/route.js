export async function GET() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  return Response.json({
    GMAIL_USER: user ? `✓ ${user}` : '✗ no configurada',
    GMAIL_PASS: pass ? `✓ ${pass.length} caracteres` : '✗ no configurada',
  });
}
