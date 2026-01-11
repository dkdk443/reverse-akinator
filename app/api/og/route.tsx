import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const personName = searchParams.get('name') || '???';
    const personNameEn = searchParams.get('name_en') || '';
    const catchphrase = searchParams.get('catchphrase') || '';
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
              width: '900px',
              backgroundColor: 'white',
              borderRadius: '20px',
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
                padding: '32px 48px',
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'white',
                  borderRadius: '9999px',
                  color: '#4f46e5',
                  fontSize: '48px',
                  marginBottom: '12px',
                  boxShadow: '0 0 0 5px rgba(165, 180, 252, 0.5)',
                }}
              >
                {result === 'win' ? '✨' : '❌'}
              </div>

              {/* Result badge */}
              <div
                style={{
                  display: 'flex',
                  fontSize: '14px',
                  color: '#c7d2fe',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  border: '2px solid rgba(165, 180, 252, 0.5)',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  marginBottom: '8px',
                }}
              >
                {result === 'win' ? '正解' : '不正解'}
              </div>

              {/* Person name */}
              <div
                style={{
                  display: 'flex',
                  fontSize: '56px',
                  fontWeight: 900,
                  color: 'white',
                  marginBottom: '4px',
                  letterSpacing: '-0.02em',
                }}
              >
                {personName}
              </div>

              {/* English name */}
              {personNameEn && (
                <div
                  style={{
                    display: 'flex',
                    fontSize: '16px',
                    color: '#c7d2fe',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    marginBottom: catchphrase ? '12px' : '0px',
                  }}
                >
                  {personNameEn}
                </div>
              )}

              {/* Catchphrase */}
              {catchphrase && (
                <div
                  style={{
                    display: 'flex',
                    backgroundColor: '#facc15',
                    color: '#713f12',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    padding: '6px 20px',
                    borderRadius: '9999px',
                    border: '2px solid #fde047',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transform: 'rotate(-1deg)',
                  }}
                >
                  {catchphrase}
                </div>
              )}
            </div>

            {/* Content - Slate background */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                padding: '32px 48px',
              }}
            >
              {/* Stats grid */}
              <div
                style={{
                  display: 'flex',
                  gap: '24px',
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
                    padding: '20px 32px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', fontSize: '13px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
                    難易度
                  </div>
                  <div style={{ display: 'flex', fontSize: '36px', fontWeight: 'bold', color: '#334155' }}>
                    {difficulty}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    padding: '20px 32px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', fontSize: '13px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
                    質問数
                  </div>
                  <div style={{ display: 'flex', fontSize: '36px', fontWeight: 'bold', color: '#334155' }}>
                    {questionCount}回
                  </div>
                </div>
              </div>

              {/* Footer branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '28px',
                  color: '#64748b',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#4f46e5',
                    borderRadius: '9999px',
                    fontSize: '20px',
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
