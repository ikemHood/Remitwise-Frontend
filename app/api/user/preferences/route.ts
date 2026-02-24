import { NextRequest, NextResponse } from 'next/server';
import { validatePreferencesUpdate, ValidationError } from '@/utils/validation/preferences-validation';
import { DEFAULT_PREFERENCES } from '@/utils/constants/supported-values';
import { UserPreferences } from '@/utils/types/user.types';

// In-memory storage for demo purposes (replace with actual database in production)
let userPreferences: UserPreferences = { ...DEFAULT_PREFERENCES };

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    validatePreferencesUpdate(body);
    
    // Update preferences with validated data
    userPreferences = {
      ...userPreferences,
      ...body,
    };
    
    return NextResponse.json({
      success: true,
      data: userPreferences,
    });
    
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: userPreferences,
  });
}
