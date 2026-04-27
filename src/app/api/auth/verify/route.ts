import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token dengan backend - GET /api/auth/verify
    const response = await fetch('http://localhost:5000/api/auth/verify', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Token tidak valid atau expired' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Token valid',
      user: data.user,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
