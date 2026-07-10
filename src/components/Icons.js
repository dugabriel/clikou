// Ícones SVG da interface (traço 1.8, herdam a cor do texto via currentColor)

function Base({ children, size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function CameraIcon(props) {
  return (
    <Base {...props}>
      <path d="M3 8a2 2 0 0 1 2-2h1.6a2 2 0 0 0 1.7-.9l.7-1.2A2 2 0 0 1 10.7 3h2.6a2 2 0 0 1 1.7.9l.7 1.2a2 2 0 0 0 1.7.9H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="13" r="3.5" />
    </Base>
  );
}

export function CartIcon(props) {
  return (
    <Base {...props}>
      <circle cx="9" cy="20" r="1.3" />
      <circle cx="17" cy="20" r="1.3" />
      <path d="M2.5 3.5h2l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2l1.8-8.2H6" />
    </Base>
  );
}

export function WalletIcon(props) {
  return (
    <Base {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2Z" />
      <circle cx="16.5" cy="14" r="1" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function DownloadIcon(props) {
  return (
    <Base {...props}>
      <path d="M12 4v10" />
      <path d="m7.5 10.5 4.5 4 4.5-4" />
      <path d="M4.5 19.5h15" />
    </Base>
  );
}

export function CheckIcon(props) {
  return (
    <Base {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Base>
  );
}

export function XIcon(props) {
  return (
    <Base {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Base>
  );
}

export function ClockIcon(props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Base>
  );
}

export function ArrowIcon(props) {
  return (
    <Base {...props}>
      <path d="M4 12h16" />
      <path d="m13.5 5.5 6.5 6.5-6.5 6.5" />
    </Base>
  );
}

export function GlobeIcon(props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5Z" />
    </Base>
  );
}

export function InstagramIcon(props) {
  return (
    <Base {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function WhatsAppIcon(props) {
  return (
    <Base {...props}>
      <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5Z" />
      <path d="M9 8.8c0 3.4 2.8 6.2 6.2 6.2l.9-1.6-2-1.2-1 .8a4.6 4.6 0 0 1-2.1-2.1l.8-1-1.2-2Z" />
    </Base>
  );
}

export function LinkIcon(props) {
  return (
    <Base {...props}>
      <path d="M10 14a4 4 0 0 0 6 .4l2.5-2.5a4 4 0 0 0-5.7-5.7L11.5 7.5" />
      <path d="M14 10a4 4 0 0 0-6-.4L5.5 12.1a4 4 0 0 0 5.7 5.7l1.3-1.3" />
    </Base>
  );
}

export function TicketIcon(props) {
  return (
    <Base {...props}>
      <path d="M3.5 9a3 3 0 0 1 0 6v1.5A1.5 1.5 0 0 0 5 18h14a1.5 1.5 0 0 0 1.5-1.5V15a3 3 0 0 1 0-6V7.5A1.5 1.5 0 0 0 19 6H5a1.5 1.5 0 0 0-1.5 1.5Z" />
      <path d="M14 6v2.5M14 11v2M14 15.5V18" />
    </Base>
  );
}

export function ScanFaceIcon(props) {
  return (
    <Base {...props}>
      <path d="M3.5 8V5.5a2 2 0 0 1 2-2H8" />
      <path d="M16 3.5h2.5a2 2 0 0 1 2 2V8" />
      <path d="M20.5 16v2.5a2 2 0 0 1-2 2H16" />
      <path d="M8 20.5H5.5a2 2 0 0 1-2-2V16" />
      <path d="M9 15.2a4.3 4.3 0 0 0 6 0" />
      <circle cx="9" cy="10" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="0.6" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function ImageIcon(props) {
  return (
    <Base {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="9.5" r="1.5" />
      <path d="m20.5 15.5-3.2-3.2a1.8 1.8 0 0 0-2.6 0L7 19.5" />
    </Base>
  );
}

export function PackageIcon(props) {
  return (
    <Base {...props}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" />
      <path d="m4 7.5 8 4.5 8-4.5" />
      <path d="M12 12v9" />
      <path d="m8 5.3 8 4.4" />
    </Base>
  );
}

export function BanknoteIcon(props) {
  return (
    <Base {...props}>
      <rect x="3" y="6.5" width="18" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="6.8" cy="12" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="17.2" cy="12" r="0.5" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function PaletteIcon(props) {
  return (
    <Base {...props}>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 2-.9 2-2 0-.6-.2-1-.5-1.4-.3-.4-.5-.8-.5-1.4a2 2 0 0 1 2-2h2.4a3.1 3.1 0 0 0 3.1-3.1A7.7 7.7 0 0 0 12 3.5Z" />
      <circle cx="8" cy="10" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10" r="0.8" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function ChartIcon(props) {
  return (
    <Base {...props}>
      <path d="M3.5 17.5 9.5 11l4 4 7-7.5" />
      <path d="M15.5 7.5h5v5" />
    </Base>
  );
}

export function StarIcon({ filled = false, ...props }) {
  return (
    <Base {...props}>
      <path
        d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z"
        fill={filled ? "currentColor" : "none"}
      />
    </Base>
  );
}

export function HeartIcon({ filled = false, ...props }) {
  return (
    <Base {...props}>
      <path
        d="M12 20.5 4.7 13a4.8 4.8 0 1 1 7-6.6l.3.3.3-.3a4.8 4.8 0 1 1 7 6.6Z"
        fill={filled ? "currentColor" : "none"}
      />
    </Base>
  );
}

export function LockIcon(props) {
  return (
    <Base {...props}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5v-3a4 4 0 0 1 8 0v3" />
    </Base>
  );
}

export function MailIcon(props) {
  return (
    <Base {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m4.5 8 7.5 5.5L19.5 8" />
    </Base>
  );
}

export function RocketIcon(props) {
  return (
    <Base {...props}>
      <path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 21.5 2.5c0 2.7-.8 7.5-5.6 10.6A22.4 22.4 0 0 1 12 15Z" />
      <path d="M9 12H4.5s.5-2.7 1.8-3.6C7.7 7.5 9.5 8 9.5 8" />
      <path d="M12 15v4.5s2.7-.5 3.6-1.8c.9-1.4.4-3.2.4-3.2" />
    </Base>
  );
}
