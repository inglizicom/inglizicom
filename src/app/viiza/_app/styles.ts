/** The CSS every interactive book shares (VIIZA and PIIRMI): scrollbars, the stamp and shake animations, the book view's sheet. */
export const APP_CSS = `
body { background: #F5EFE3 }
.no-scrollbar::-webkit-scrollbar { display: none }
.no-scrollbar { scrollbar-width: none }
@keyframes vz-stamp { 0% { transform: scale(2.2) rotate(-12deg); opacity: 0 } 70% { transform: scale(0.92) rotate(-12deg); opacity: 1 } 100% { transform: scale(1) rotate(-12deg) } }
@keyframes vz-shake { 0%, 100% { transform: translateX(0) } 25% { transform: translateX(-6px) } 75% { transform: translateX(6px) } }
.vz-shake { animation: vz-shake .35s ease-in-out }
/* Book view: the printed sheet without its print toolbar and frame */
.vz-bookpage .print-sheet-wrap > div:first-child { display: none }
.vz-bookpage .print-sheet-wrap > div:last-child { overflow: visible !important; border-radius: 0 !important; box-shadow: none !important; --tw-ring-shadow: 0 0 #0000 !important }
.vz-bookpage .print-sheet { cursor: pointer }
`
