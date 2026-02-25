import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie || sessionCookie.value !== 'mock-session-cookie') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
        allocations: {
            dailySpending: 50,
            savings: 30,
            bills: 15,
            insurance: 5
        }
    });
}
