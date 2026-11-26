// Side-view line drawings of the two presses, technically right:
// - sheetfed offset, 4 separate units (K C M Y in sheet order), feeder on the right with the blank pile on a
//   pallet on the floor, delivery on the left with the printed pile, ColorLoop console beside the delivery;
// - narrow-web flexo label press, 7 stations (C M Y K + orange, green, violet), UV lamp after each station,
//   DeltaOne camera over the web after the last station, unwind on the left, rewind on the right.
// Strokes do not scale, so the lines stay 1.25 px whatever the drawing size. Sheets and web move gently.

const INK = { C: '#1aa3e0', M: '#e5007e', Y: '#f5c400', K: '#1d1d1f', O: '#f28c28', G: '#2ba84a', V: '#6b4fbb' };

type P = { x: number; y: number; w: number; id: string };

const line = { vectorEffect: 'non-scaling-stroke' as const };

function Pallet({ x, w }: { x: number; w: number }) {
  return (
    <g>
      <rect x={x} y={228} width={w} height={10} rx={2} className="pr-fill" style={line} />
      {[0, 0.5, 1].map((k) => (
        <rect key={k} x={x + k * (w - 12)} y={238} width={12} height={10} className="pr-fill" style={line} />
      ))}
    </g>
  );
}

function Pile({ x, y, w, h, printed }: { x: number; y: number; w: number; h: number; printed?: boolean }) {
  const n = Math.floor(h / 9);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2} className="pr-paper" style={line} />
      {Array.from({ length: n - 1 }, (_, i) => (
        <path key={i} d={`M${x + 3} ${y + (i + 1) * 9}H${x + w - 3}`} className="pr-thin" style={line} />
      ))}
      {printed &&
        [INK.C, INK.M, INK.Y, INK.K].map((c, i) => (
          <rect key={c} x={x + 8 + i * ((w - 16) / 4)} y={y - 1} width={(w - 16) / 4 - 3} height={3} fill={c} />
        ))}
    </g>
  );
}

function OffsetUnit({ x, ink }: { x: number; ink: string }) {
  const cx = x + 42;
  return (
    <g>
      <rect x={x} y={78} width={84} height={170} rx={8} className="pr-body" style={line} />
      <path d={`M${x + 14} 56H${x + 70}L${x + 62} 74H${x + 22}Z`} className="pr-stroke" style={{ ...line, fill: ink }} />
      {[-16, 0, 16].map((dx, i) => (
        <circle key={dx} cx={cx + dx} cy={i === 1 ? 100 : 92} r={5.5} className="pr-fill" style={line} />
      ))}
      <circle cx={cx + 6} cy={131} r={16} className="pr-fill" style={line} />
      <circle cx={cx + 6} cy={131} r={16} fill={ink} fillOpacity={0.18} />
      <circle cx={cx - 6} cy={163} r={16} className="pr-fill" style={line} />
      <circle cx={cx + 4} cy={203} r={20} className="pr-fill" style={line} />
      <circle cx={cx + 4} cy={203} r={3} className="pr-dot" />
    </g>
  );
}

export function OffsetSchematic({ x, y, w, id }: P) {
  const s = w / 720;
  const units: [number, string][] = [
    [516, INK.K],
    [414, INK.C],
    [312, INK.M],
    [210, INK.Y],
  ];
  const path = 'M664 140 L606 182 L206 182 C188 182 196 70 176 70 L112 70 L112 150';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="pr">
      <path d="M0 248H720" className="pr-ground" style={line} />
      {/* ColorLoop console beside the delivery */}
      <path d="M36 248V168M18 248H54" className="pr-stroke" style={line} />
      <rect x={0} y={112} width={72} height={56} rx={6} className="pr-screen" style={line} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
        const h = [22, 30, 16, 26, 34, 20, 28, 18, 24][i];
        return <rect key={i} x={7 + i * 6.6} y={160 - h} width={4.4} height={h} rx={1} fill={i % 3 === 0 ? '#34c759' : i % 3 === 1 ? '#ffd60a' : '#34c759'} />;
      })}
      {/* delivery: chain over the top, printed pile on a pallet */}
      <path d="M92 248V60a6 6 0 0 1 6-6H200V80H104" className="pr-stroke" style={line} />
      <path d="M104 80V100" className="pr-thin" style={line} />
      <Pile x={110} y={150} w={74} h={78} printed />
      <Pallet x={106} w={82} />
      {/* four printing units with a walk-in gap between them, transfer drums low in the gaps */}
      {units.map(([ux, ink]) => (
        <OffsetUnit key={ux} x={ux} ink={ink} />
      ))}
      {[303, 405, 507].map((gx) => (
        <circle key={gx} cx={gx} cy={214} r={9} className="pr-fill" style={line} />
      ))}
      {/* feeder: blank pile on a pallet, suction head, feed board down to the first unit */}
      <path d="M708 248V60H628V72H700" className="pr-stroke" style={line} />
      <rect x={640} y={98} width={58} height={12} rx={3} className="pr-fill" style={line} />
      <path d="M669 72V98" className="pr-thin" style={line} />
      <Pile x={632} y={140} w={68} h={88} />
      <Pallet x={628} w={76} />
      <path d="M632 140L604 178" className="pr-stroke" style={line} />
      {/* sheets travelling right to left */}
      <path id={id} d={path} fill="none" />
      {[0, 1, 2, 3].map((k) => (
        <rect key={k} x={-9} y={-1.5} width={18} height={3} rx={1} className="pr-sheet">
          <animateMotion dur="4.8s" begin={`-${k * 1.2}s`} repeatCount="indefinite" rotate="auto">
            <mpath href={`#${id}`} />
          </animateMotion>
        </rect>
      ))}
    </g>
  );
}

function FlexoStation({ x, ink }: { x: number; ink: string }) {
  const cx = x + 30;
  return (
    <g>
      <rect x={x} y={112} width={74} height={136} rx={8} className="pr-body" style={line} />
      <rect x={cx + 26} y={116} width={14} height={26} rx={4} className="pr-stroke" style={{ ...line, fill: ink }} />
      <circle cx={cx + 17} cy={138} r={9} className="pr-fill" style={line} />
      <circle cx={cx} cy={162} r={13} className="pr-fill" style={line} />
      <circle cx={cx} cy={162} r={13} fill={ink} fillOpacity={0.18} />
      <circle cx={cx} cy={190} r={12} className="pr-fill" style={line} />
      <circle cx={cx} cy={190} r={2.5} className="pr-dot" />
      {/* UV lamp after the station */}
      <path d={`M${x + 64} 112V100`} className="pr-thin" style={line} />
      <rect x={x + 50} y={84} width={34} height={16} rx={4} className="pr-fill" style={line} />
      <path d={`M${x + 54} 106H${x + 80}`} className="pr-uv" style={line} />
    </g>
  );
}

export function FlexoSchematic({ x, y, w, id }: P) {
  const s = w / 900;
  const inks = [INK.C, INK.M, INK.Y, INK.K, INK.O, INK.G, INK.V];
  const web = 'M100 176 H846';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="pr">
      <path d="M0 248H900" className="pr-ground" style={line} />
      {/* unwind */}
      <path d="M64 150L40 248M64 150L88 248" className="pr-stroke" style={line} />
      <circle cx={64} cy={140} r={46} className="pr-paper" style={line} />
      <circle cx={64} cy={140} r={30} className="pr-thin" style={line} />
      <circle cx={64} cy={140} r={10} className="pr-fill" style={line} />
      <path d="M64 186 C84 186 96 176 120 176" className="pr-web" style={line} />
      <circle cx={132} cy={184} r={6} className="pr-fill" style={line} />
      {/* seven print stations */}
      {inks.map((ink, i) => (
        <FlexoStation key={ink} x={150 + i * 86} ink={ink} />
      ))}
      {/* DeltaOne camera over the web, after the last station */}
      <path d="M800 248V164" className="pr-stroke" style={line} />
      <rect x={772} y={118} width={58} height={40} rx={6} className="pr-d1" style={line} />
      <circle cx={801} cy={138} r={7} className="pr-lens" style={line} />
      <path d="M801 158V174" className="pr-scan" style={line} />
      {/* rewind */}
      <path d="M866 150L846 248M866 150L886 248" className="pr-stroke" style={line} />
      <circle cx={866} cy={140} r={30} className="pr-paper" style={line} />
      <circle cx={866} cy={140} r={9} className="pr-fill" style={line} />
      {/* the web, moving left to right */}
      <path d={web} className="pr-web" style={line} />
      <path d="M846 176 C856 176 860 170 866 170" className="pr-web" style={line} />
      <path id={id} d={web} className="pr-web-run" style={line} />
    </g>
  );
}
