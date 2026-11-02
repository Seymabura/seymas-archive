type P = { size?: number };
const base = (size: number) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true,
});

export const SearchIcon = ({ size = 18 }: P) => (<svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const CloseIcon = ({ size = 18 }: P) => (<svg {...base(size)}><path d="M18 6 6 18M6 6l12 12" /></svg>);
export const PrevIcon = ({ size = 20 }: P) => (<svg {...base(size)}><path d="m15 18-6-6 6-6" /></svg>);
export const NextIcon = ({ size = 20 }: P) => (<svg {...base(size)}><path d="m9 18 6-6-6-6" /></svg>);
export const PlusIcon = ({ size = 16 }: P) => (<svg {...base(size)} strokeWidth={2.6}><path d="M12 5v14M5 12h14" /></svg>);
export const LinkIcon = ({ size = 16 }: P) => (<svg {...base(size)}><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" /></svg>);
export const DownloadIcon = ({ size = 16 }: P) => (<svg {...base(size)}><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" /></svg>);
export const UploadIcon = ({ size = 36 }: P) => (<svg {...base(size)} strokeWidth={1.5}><path d="M12 16V4m0 0-4 4m4-4 4 4" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>);
export const XLogo = ({ size = 15 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
  </svg>
);
