// Ícones SVG da interface (traço 1.8, herdam a cor do texto via currentColor)

function Base({ children, tamanho = 24, className = "" }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
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

export function IconeCamera(props) {
  return (
    <Base {...props}>
      <path d="M3 8a2 2 0 0 1 2-2h1.6a2 2 0 0 0 1.7-.9l.7-1.2A2 2 0 0 1 10.7 3h2.6a2 2 0 0 1 1.7.9l.7 1.2a2 2 0 0 0 1.7.9H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="13" r="3.5" />
    </Base>
  );
}

export function IconeCarrinho(props) {
  return (
    <Base {...props}>
      <circle cx="9" cy="20" r="1.3" />
      <circle cx="17" cy="20" r="1.3" />
      <path d="M2.5 3.5h2l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2l1.8-8.2H6" />
    </Base>
  );
}

export function IconeCarteira(props) {
  return (
    <Base {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2Z" />
      <circle cx="16.5" cy="14" r="1" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function IconeDownload(props) {
  return (
    <Base {...props}>
      <path d="M12 4v10" />
      <path d="m7.5 10.5 4.5 4 4.5-4" />
      <path d="M4.5 19.5h15" />
    </Base>
  );
}

export function IconeCheck(props) {
  return (
    <Base {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Base>
  );
}

export function IconeX(props) {
  return (
    <Base {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Base>
  );
}

export function IconeRelogio(props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Base>
  );
}

export function IconeSeta(props) {
  return (
    <Base {...props}>
      <path d="M4 12h16" />
      <path d="m13.5 5.5 6.5 6.5-6.5 6.5" />
    </Base>
  );
}

export function IconeGlobo(props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5Z" />
    </Base>
  );
}

export function IconeInstagram(props) {
  return (
    <Base {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function IconeWhatsApp(props) {
  return (
    <Base {...props}>
      <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5Z" />
      <path d="M9 8.8c0 3.4 2.8 6.2 6.2 6.2l.9-1.6-2-1.2-1 .8a4.6 4.6 0 0 1-2.1-2.1l.8-1-1.2-2Z" />
    </Base>
  );
}

export function IconeLink(props) {
  return (
    <Base {...props}>
      <path d="M10 14a4 4 0 0 0 6 .4l2.5-2.5a4 4 0 0 0-5.7-5.7L11.5 7.5" />
      <path d="M14 10a4 4 0 0 0-6-.4L5.5 12.1a4 4 0 0 0 5.7 5.7l1.3-1.3" />
    </Base>
  );
}
