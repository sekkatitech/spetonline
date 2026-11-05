// Small "Pre-order" sticker. Pinned to the corner of its parent, which must be position: relative, unless inline.
export default function ApplePreorderBadge({ inline = false }: { inline?: boolean }) {
  return (
    <span style={{
      ...(inline ? { display: 'inline-block' } : { position: 'absolute', top: 12, left: 12, zIndex: 1 }),
      background: '#b64400', color: '#ffffff',
      fontSize: 12, fontWeight: 600, lineHeight: 1,
      padding: '6px 10px', borderRadius: 980,
      letterSpacing: '-0.01em', whiteSpace: 'nowrap',
    }}>
      Pre-order
    </span>
  )
}
