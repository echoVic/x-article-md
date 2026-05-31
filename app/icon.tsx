import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
          borderRadius: '7px',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.5px',
          }}
        >
          M
        </span>
        <span
          style={{
            fontSize: '10px',
            color: '#6b8afd',
            margin: '0 1px',
          }}
        >
          →
        </span>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.5px',
          }}
        >
          X
        </span>
      </div>
    ),
    { ...size }
  )
}
