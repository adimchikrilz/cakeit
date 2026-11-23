// Illustrated two-tier cake. Replace with a real photo via EVENT.photo in lib/config.js
export default function Cake() {
  const scallops = (x0, n, step, y, r) => Array.from({ length: n }, (_, i) => <circle key={i} cx={x0 + i * step} cy={y} r={r} fill="#fff" />);
  const piping = ["#C2185B", "#2F5BEA", "#FFD86B"];
  const sprinkles = [[88, 300, 20, "#2F5BEA"], [140, 328, -30, "#FFD86B"], [200, 306, 60, "#fff"], [262, 332, 10, "#2F5BEA"], [312, 298, -50, "#FFD86B"], [132, 200, 35, "#FFD86B"], [190, 246, -20, "#fff"], [248, 202, 70, "#2F5BEA"]];
  return (
    <svg viewBox="0 0 400 420" role="img" aria-label="A two-tier cake decorated with piped frosting and sprinkles">
      <ellipse cx="200" cy="380" rx="172" ry="20" fill="#EBD3DD" />
      <ellipse cx="200" cy="366" rx="172" ry="22" fill="#fff" stroke="#EBD3DD" strokeWidth="3" />
      <rect x="60" y="262" width="280" height="100" rx="18" fill="#F7B9D1" />
      {scallops(78, 10, 27.5, 262, 16)}
      <rect x="60" y="334" width="280" height="10" fill="#fff" opacity=".55" />
      <rect x="105" y="170" width="190" height="95" rx="16" fill="#C2185B" />
      <rect x="105" y="222" width="190" height="10" fill="#FFD86B" />
      {scallops(122, 7, 26, 170, 15)}
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={128 + i * 24} cy={158} r={12} fill={piping[i % 3]} />)}
      <path d="M200 112 Q212 88 232 84" stroke="#2E7D32" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="200" cy="130" r="17" fill="#D32F2F" />
      <circle cx="194" cy="124" r="4" fill="#fff" opacity=".7" />
      {sprinkles.map(([x, y, a, c], i) => <rect key={i} x={x - 9} y={y - 3} width="18" height="6" rx="3" fill={c} transform={`rotate(${a} ${x} ${y})`} />)}
      <circle cx="38" cy="190" r="8" fill="#C2185B" /><circle cx="366" cy="236" r="10" fill="#2F5BEA" />
      <circle cx="338" cy="112" r="6" fill="#2A1730" /><circle cx="64" cy="108" r="6" fill="#fff" />
    </svg>
  );
}
