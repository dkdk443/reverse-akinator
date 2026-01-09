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
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
          }}
        >
          {/* Modal Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '1000px',
              backgroundColor: 'white',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header - Indigo background like ResultModal */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#4f46e5',
                padding: '48px 60px',
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'white',
                  borderRadius: '9999px',
                  color: '#4f46e5',
                  fontSize: '60px',
                  marginBottom: '16px',
                  boxShadow: '0 0 0 6px rgba(165, 180, 252, 0.5)',
                }}
              >
                {result === 'win' ? '✨' : '❌'}
              </div>

              {/* Result badge */}
              <div
                style={{
                  display: 'flex',
                  fontSize: '18px',
                  color: '#c7d2fe',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  border: '2px solid rgba(165, 180, 252, 0.5)',
                  padding: '4px 16px',
                  borderRadius: '9999px',
                  marginBottom: '12px',
                }}
              >
                {result === 'win' ? '正解' : '不正解'}
              </div>

              {/* Person name */}
              <div
                style={{
                  display: 'flex',
                  fontSize: '72px',
                  fontWeight: 900,
                  color: 'white',
                  marginBottom: '8px',
                  letterSpacing: '-0.02em',
                }}
              >
                {personName}
              </div>
            </div>

            {/* Content - Slate background */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                padding: '48px 60px',
              }}
            >
              {/* Stats grid */}
              <div
                style={{
                  display: 'flex',
                  gap: '32px',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    padding: '24px 40px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', fontSize: '16px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    難易度
                  </div>
                  <div style={{ display: 'flex', fontSize: '42px', fontWeight: 'bold', color: '#334155' }}>
                    {difficulty}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    padding: '24px 40px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', fontSize: '16px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    質問数
                  </div>
                  <div style={{ display: 'flex', fontSize: '42px', fontWeight: 'bold', color: '#334155' }}>
                    {questionCount}回
                  </div>
                </div>
              </div>

              {/* Footer branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '40px',
                  color: '#64748b',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#4f46e5',
                    borderRadius: '9999px',
                    fontSize: '24px',
                  }}
                >
                  🧠
                </div>
                <div style={{ display: 'flex' }}>Reverse Akinator</div>
              </div>
            </div>
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
