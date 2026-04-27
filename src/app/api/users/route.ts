import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Fetch users dari backend
    const response = await fetch('http://localhost:5000/api/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Gagal mengambil data users' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.users || data,
    });
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const body = await request.json();

    // Create user di backend
    const response = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Gagal menambah user' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'User berhasil ditambahkan',
      data: data.user || data,
    });
  } catch (error) {
    console.error('Users POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
