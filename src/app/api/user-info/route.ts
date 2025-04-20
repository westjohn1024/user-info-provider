import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    // Get IP address from request headers (X-Forwarded-For for proxied requests)
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1';
    
    // Create user info record
    const userInfo = await prisma.userInfo.create({
      data: {
        ipAddress: ipAddress as string,
        userAgent: request.headers.get('user-agent') || undefined,
        ...userData,
      },
    });

    return NextResponse.json({ success: true, id: userInfo.id }, { status: 201 });
  } catch (error) {
    console.error('Error saving user info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save user information' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const userInfoCount = await prisma.userInfo.count();
    
    return NextResponse.json({ 
      success: true, 
      count: userInfoCount,
      message: `Total visitors: ${userInfoCount}`
    });
  } catch (error) {
    console.error('Error fetching user count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch visitor count' },
      { status: 500 }
    );
  }
} 