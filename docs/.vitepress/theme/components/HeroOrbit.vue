<template>
    <div class="hero-orbit" aria-hidden="true">
        <div class="hero-orbit__caption"><span>FIELD NOTES / FRONTEND</span><span>∞</span></div>
        <svg class="hero-orbit__sphere" viewBox="0 0 520 460" fill="none">
            <defs>
                <radialGradient id="sphere-glow"><stop stop-color="#38e8d0" stop-opacity=".18"/><stop offset="1" stop-color="#38e8d0" stop-opacity="0"/></radialGradient>
                <linearGradient id="orbit-light"><stop stop-color="#42ebd2" stop-opacity=".1"/><stop offset=".5" stop-color="#42ebd2"/><stop offset="1" stop-color="#7a91ff" stop-opacity=".25"/></linearGradient>
            </defs>
            <circle cx="260" cy="230" r="208" fill="url(#sphere-glow)"/>
            <g stroke="currentColor" stroke-width=".7" opacity=".35">
                <path d="M40 230H480M260 20V440" stroke-dasharray="3 7"/>
                <circle cx="260" cy="230" r="146"/>
                <ellipse v-for="radius in [35, 75, 112]" :key="radius" cx="260" cy="230" :rx="radius" ry="146"/>
                <ellipse v-for="radius in [35, 75, 112]" :key="`lat-${radius}`" cx="260" cy="230" rx="146" :ry="radius"/>
                <circle cx="260" cy="230" r="196" stroke-dasharray="2 10"/>
            </g>
            <g class="hero-orbit__ring">
                <ellipse cx="260" cy="230" rx="230" ry="76" transform="rotate(-32 260 230)" stroke="url(#orbit-light)" stroke-width="1.5"/>
                <circle cx="455" cy="110" r="4" fill="#59f6d8"/>
                <circle cx="455" cy="110" r="10" stroke="#59f6d8" opacity=".25"/>
            </g>
            <ellipse cx="260" cy="230" rx="200" ry="68" transform="rotate(40 260 230)" stroke="currentColor" opacity=".18"/>
            <path d="m239 212-20 18 20 18m42-36 20 18-20 18m-16-42-10 52" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="hero-orbit__label hero-orbit__label--one">01 / JAVASCRIPT</span>
        <span class="hero-orbit__label hero-orbit__label--two">02 / WEBGL</span>
        <div class="hero-orbit__footer"><span class="hero-orbit__signal"/> CONNECTING IDEAS <span>CODE → CREATE</span></div>
    </div>
</template>

<style scoped>
.hero-orbit {
    position: relative; width: 100%; max-width: 540px; aspect-ratio: 1.12; color: var(--vp-c-brand-1);
    & .hero-orbit__caption, & .hero-orbit__footer { position: absolute; left: 24px; right: 24px; display: flex; align-items: center; justify-content: space-between; font: 10px/1.5 var(--vp-font-family-mono); letter-spacing: 2px; color: var(--blog-muted); }
    & .hero-orbit__caption { top: 18px; border-top: 1px solid var(--blog-border); padding-top: 12px; }
    & .hero-orbit__sphere { width: 100%; height: 100%; }
    & .hero-orbit__ring { transform-origin: 260px 230px; animation: orbit-drift 18s ease-in-out infinite alternate; }
    & .hero-orbit__label { position: absolute; padding: 7px 12px; border: 1px solid var(--blog-border); background: var(--blog-panel); font: 10px/1.5 var(--vp-font-family-mono); letter-spacing: 1px; }
    & .hero-orbit__label--one { top: 27%; left: 0; }
    & .hero-orbit__label--two { right: 0; bottom: 25%; }
    & .hero-orbit__footer { bottom: 10px; justify-content: flex-start; gap: 8px; font-size: 9px; letter-spacing: 1px; }
    & .hero-orbit__footer > span:last-child { margin-left: auto; }
    & .hero-orbit__signal { width: 5px; height: 5px; border-radius: 50%; background: var(--vp-c-brand-1); box-shadow: 0 0 12px var(--vp-c-brand-1); }
    @media (prefers-reduced-motion: reduce) { & .hero-orbit__ring { animation: none; } }
}
@keyframes orbit-drift { to { transform: rotate(18deg); } }
</style>
