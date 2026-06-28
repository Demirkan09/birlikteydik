# Landing Page Critique — 2026-06-28

Target: / (src/app/page.tsx)
Score: 24/40
P0: 0 | P1: 2 | P2: 3

## Summary
Sayfanin ilk bakis hissi iyi (koyu fon, altin aksan, sinematik animasyonlar). Ancak her section ayni eyebrow+grid gramerine sahip; ghost-card pattern (border+wide shadow) kartlarda var; metin kontrasti WCAG altinda; reduced-motion support yok.

## Priority Issues
- P1: Her bolumde tekrar eden eyebrow + ayni grid iskeleti
- P1: OccasionCard ve template kartlarinda ghost-card pattern (border+radius+shadow)
- P2: SectionLabel eyebrow her section basta
- P2: rgba(240,237,232,0.45) body text kontrastı WCAG altında (~3.3:1)
- P2: prefers-reduced-motion support yok
