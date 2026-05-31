import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a2e',
          borderRadius: '36px',
          fontFamily: 'monospace',
          gap: '2px',
        }}
      >
        <span
          style={{
            fontSize: '72px',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-2px',
          }}
        >
          M
        </span>
        <span
          style={{
            fontSize: '48px',
            color: '#6b8afd',
            margin: '0 2px',
          }}
        >
          →
        </span>
        <span
          style={{
            fontSize: '72px',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-2px',
          }}
        >
          X
        </span>
      </div>
    ),
    { ...size }
  )
}
