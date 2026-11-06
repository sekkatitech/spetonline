// Small "Pre-order" sticker. Pinned to the corner of its parent, which must be
// position: relative, unless inline.
export default function ApplePreorderBadge({ inline = false }: { inline?: boolean }) {
  return (
    <span
      className={`rounded-full bg-apple-alert px-2.5 py-1.5 text-[12px] font-semibold leading-none text-white ${
        inline ? 'inline-block' : 'absolute left-3 top-3 z-10'
      }`}
    >
      Pre-order
    </span>
  )
}
