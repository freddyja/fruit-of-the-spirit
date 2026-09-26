import type { SceneId } from '../scripture/daily'

export function SceneArt({ scene }: { scene: SceneId }) {
  return (
    <div className={`scene scene-${scene}`} aria-hidden="true">
      <div className="scene-glow" />
      <svg className="scene-svg" viewBox="0 0 360 220">
        {scene === 'vine' || scene === 'grapes' || scene === 'fig' ? <Grapes /> : null}
        {scene === 'book' ? <OpenBook /> : null}
        {scene === 'olive' ? <Olive /> : null}
        {scene === 'water' ? <Water /> : null}
        {scene === 'fig' ? <Fig /> : null}
      </svg>
    </div>
  )
}

function Grapes() {
  return (
    <g fill="#e0c36a" opacity="0.92" transform="translate(30 -36)">
      <circle cx="250" cy="78" r="16" />
      <circle cx="226" cy="100" r="18" />
      <circle cx="274" cy="102" r="18" />
      <circle cx="214" cy="132" r="17" />
      <circle cx="250" cy="128" r="20" />
      <circle cx="286" cy="134" r="17" />
      <circle cx="232" cy="160" r="16" />
      <circle cx="268" cy="162" r="16" />
      <path d="M250 40c8 14 8 24 2 36" fill="none" stroke="#e0c36a" strokeWidth="3" />
      <path d="M252 58c28-6 40 8 36 24" fill="none" stroke="#c9a24a" strokeWidth="3" />
    </g>
  )
}

function OpenBook() {
  return (
    <g fill="none" stroke="#e0c36a" strokeWidth="2.4">
      <path d="M70 150c40-28 70-28 110-8v48c-40-18-70-16-110 8z" fill="rgba(224,195,106,0.16)" />
      <path d="M290 150c-40-28-70-28-110-8v48c40-18 70-16 110 8z" fill="rgba(224,195,106,0.16)" />
      <path d="M180 142v56" />
    </g>
  )
}

function Olive() {
  return (
    <g fill="none" stroke="#e0c36a" strokeWidth="2.4">
      <path d="M40 170c80-20 140-80 220-90" />
      <ellipse cx="150" cy="120" rx="16" ry="8" transform="rotate(-30 150 120)" fill="rgba(224,195,106,0.35)" />
      <ellipse cx="210" cy="98" rx="16" ry="8" transform="rotate(-20 210 98)" fill="rgba(224,195,106,0.35)" />
    </g>
  )
}

function Water() {
  return (
    <g fill="none" stroke="#e0c36a" strokeWidth="2">
      <path d="M20 150c30 16 50 16 80 0s50-16 80 0 50 16 80 0 50-16 80 0" opacity="0.8" />
      <path d="M20 170c30 14 50 14 80 0s50-14 80 0 50 14 80 0 50-14 80 0" opacity="0.45" />
    </g>
  )
}

function Fig() {
  return <ellipse cx="92" cy="150" rx="22" ry="28" fill="#c45a48" opacity="0.85" />
}
