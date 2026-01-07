import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personName = searchParams.get('name') || '???';
    const difficulty = searchParams.get('difficulty') || 'ふつう';
    const questionCount = searchParams.get('questions') || '0';
    const result = searchParams.get('result') || 'win';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
          }}
        >
          {/* Background pattern */}
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              background: 'radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)',
              backgroundSize: '100px 100px',
            }}
          />

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              borderRadius: '32px',
              padding: '60px 80px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
          >
            {/* Result badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: result === 'win' ? '#10b981' : '#ef4444',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '9999px',
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '24px',
              }}
            >
              {result === 'win' ? '🎯 正解！' : '❌ 不正解'}
            </div>

            {/* Person name */}
            <div
              style={{
                display: 'flex',
                fontSize: '80px',
                fontWeight: 'black',
                color: '#1e293b',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              {personName}
            </div>

            {/* Stats */}
            <div
              style={{
                display: 'flex',
                gap: '40px',
                marginTop: '32px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#eef2ff',
                  padding: '20px 32px',
                  borderRadius: '16px',
                }}
              >
                <div style={{ display: 'flex', fontSize: '24px', color: '#64748b', marginBottom: '8px' }}>
                  難易度
                </div>
                <div style={{ display: 'flex', fontSize: '36px', fontWeight: 'bold', color: '#4f46e5' }}>
                  {difficulty}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#eef2ff',
                  padding: '20px 32px',
                  borderRadius: '16px',
                }}
              >
                <div style={{ display: 'flex', fontSize: '24px', color: '#64748b', marginBottom: '8px' }}>
                  質問数
                </div>
                <div style={{ display: 'flex', fontSize: '36px', fontWeight: 'bold', color: '#4f46e5' }}>
                  {questionCount}回
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginTop: '48px',
              color: 'white',
              fontSize: '32px',
              fontWeight: 'bold',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                backgroundColor: 'white',
                borderRadius: '9999px',
              }}
            >
              🧠
            </div>
            <div style={{ display: 'flex' }}>Reverse Akinator</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
