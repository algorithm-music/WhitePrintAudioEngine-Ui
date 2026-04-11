import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'WhitePrint AudioEngine';
  const subtitle = searchParams.get('subtitle') || 'AI-Powered Audio Mastering & Analysis';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'white',
              }}
            />
          </div>
          <span style={{ color: '#71717a', fontSize: '24px', letterSpacing: '0.05em' }}>
            WhitePrint AudioEngine
          </span>
        </div>
        <div
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: '24px',
            color: '#a1a1aa',
            marginTop: '16px',
            textAlign: 'center',
            maxWidth: '600px',
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
