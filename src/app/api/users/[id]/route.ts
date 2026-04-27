import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = params.id;

    // Delete user dari backend
    const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Gagal menghapus user' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus',
    });
  } catch (error) {
    console.error('Users DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = params.id;
    const body = await request.json();

    // Update user di backend
    const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: errorData.message || 'Gagal mengupdate user' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'User berhasil diupdate',
      data: data.user || data,
    });
  } catch (error) {
    console.error('Users PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
