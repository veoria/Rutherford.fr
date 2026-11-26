// How ColorConnect works: prepress files become jobs, presets go to every press, live data comes back,
// and the right people see it. Real ColorConnect screens inside each card, data drawn as moving dots.
// Two layouts: a wide one from 900 px, a vertical one below.

const IMG = '/images/colorconnect';

type Card = {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: string[];
  shot?: { src: string; ratio: number };
};

function CardSvg({ c, id }: { c: Card; id: string }) {
  const pad = 20;
  const shotW = c.w - pad * 2;
  const shotH = c.shot ? shotW / c.shot.ratio : 0;
  const titleY = c.y + pad + (c.shot ? shotH + 34 : 30);
  return (
    <g className="ccd-card">
      <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={20} className="ccd-card-bg" />
      {c.shot && (
        <>
          <clipPath id={id}>
            <rect x={c.x + pad} y={c.y + pad} width={shotW} height={shotH} rx={10} />
          </clipPath>
          <image
            href={`${IMG}/${c.shot.src}`}
            x={c.x + pad}
            y={c.y + pad}
            width={shotW}
            height={shotH}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${id})`}
          />
          <rect x={c.x + pad} y={c.y + pad} width={shotW} height={shotH} rx={10} className="ccd-shot-edge" />
        </>
      )}
      <text x={c.x + pad} y={titleY} className="ccd-title">
        {c.title}
      </text>
      {c.lines.map((l, i) => (
        <text key={l} x={c.x + pad} y={titleY + 24 + i * 21} className="ccd-line">
          {l}
        </text>
      ))}
    </g>
  );
}

function Hub({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const logoW = w - 80;
  const logoH = (logoW * 163) / 1394;
  return (
    <g className="ccd-hub">
      <rect x={x} y={y} width={w} height={h} rx={26} className="ccd-hub-bg" />
      <image href={`${IMG}/colorconnect.png`} x={x + 40} y={y + h / 2 - logoH - 6} width={logoW} height={logoH} />
      <text x={x + w / 2} y={y + h / 2 + 30} textAnchor="middle" className="ccd-hub-line">
        Runs on your own server,
      </text>
      <text x={x + w / 2} y={y + h / 2 + 52} textAnchor="middle" className="ccd-hub-line">
        in your print shop.
      </text>
    </g>
  );
}

// A connector with dots travelling along it. `back` sends a second, green stream the other way.
function Flow({ d, id, label, lx, ly, back, dur = 2.8 }: { d: string; id: string; label?: string; lx?: number; ly?: number; back?: string; dur?: number }) {
  return (
    <g>
      <path id={id} d={d} className="ccd-line-path" />
      {[0, 1, 2].map((k) => (
        <circle key={k} r={4} className="ccd-dot">
          <animateMotion dur={`${dur}s`} begin={`${(k * dur) / 3}s`} repeatCount="indefinite" rotate="auto">
            <mpath href={`#${id}`} />
          </animateMotion>
        </circle>
      ))}
      {back &&
        [0, 1].map((k) => (
          <circle key={`b${k}`} r={4} className="ccd-dot ccd-dot-back">
            <animateMotion dur={`${dur}s`} begin={`${(k * dur) / 2 + dur / 4}s`} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
              <mpath href={`#${id}`} />
            </animateMotion>
          </circle>
        ))}
      {label && (
        <text x={lx} y={ly} textAnchor="middle" className="ccd-flow-label">
          {label}
        </text>
      )}
      {back && (
        <text x={lx} y={(ly ?? 0) + 18} textAnchor="middle" className="ccd-flow-label ccd-flow-back">
          {back}
        </text>
      )}
    </g>
  );
}

const PRE = { title: 'Prepress', lines: ['PDF and CIP3 files dropped in a', 'folder become jobs, with their inks.'], shot: { src: 'portal-ui-jobs.webp', ratio: 1070 / 474 } };
const OFF = { title: 'Offset presses', lines: ['ColorLoop at the console measures', 'the sheets and corrects the ink keys.'], shot: { src: 'portal-ui-keys.webp', ratio: 1200 / 460 } };
const FLX = { title: 'Flexo and label presses', lines: ['DeltaOne measures every ink', 'inline, without stopping the press.'], shot: { src: 'portal-ui-flexo.webp', ratio: 1616 / 350 } };
const TEAM = { title: 'Your team', lines: ['Any browser, any phone,', 'and the shop-floor TV.'] };
const CUST = { title: 'Your customers', lines: ['Their job, live, through', 'a secure link.'] };
const EVID = { title: 'Your evidence', lines: ['PPWR compliance per job,', 'from your own data.'] };

export function ColorConnectDiagram() {
  return (
    <div className="ccd">
      {/* wide layout */}
      <svg className="ccd-wide" viewBox="0 0 1200 760" role="img" aria-labelledby="ccd-title-wide">
        <title id="ccd-title-wide">
          How ColorConnect works: prepress files become jobs, presets go to offset presses with ColorLoop and flexo presses with DeltaOne, live data comes back, and your team, your customers and your compliance evidence all draw on it.
        </title>
        <Flow id="ccd-w-pre" d="M310 338 H450" label="jobs" lx={380} ly={324} />
        <Flow id="ccd-w-off" d="M750 296 C830 296 820 150 900 150" label="presets" back="live data" lx={832} ly={196} />
        <Flow id="ccd-w-flx" d="M750 380 C830 380 820 470 900 470" label="presets" back="live data" lx={832} ly={448} />
        <Flow id="ccd-w-team" d="M600 426 V520 C600 560 375 540 375 590" dur={2.4} />
        <Flow id="ccd-w-cust" d="M600 426 V590" dur={2.4} />
        <Flow id="ccd-w-evid" d="M600 426 V520 C600 560 825 540 825 590" dur={2.4} />
        <CardSvg id="ccd-c-pre" c={{ x: 20, y: 200, w: 290, h: 276, ...PRE }} />
        <Hub x={450} y={250} w={300} h={176} />
        <CardSvg id="ccd-c-off" c={{ x: 900, y: 30, w: 290, h: 240, ...OFF }} />
        <CardSvg id="ccd-c-flx" c={{ x: 900, y: 380, w: 290, h: 180, ...FLX }} />
        <CardSvg id="ccd-c-team" c={{ x: 270, y: 590, w: 210, h: 140, ...TEAM }} />
        <CardSvg id="ccd-c-cust" c={{ x: 495, y: 590, w: 210, h: 140, ...CUST }} />
        <CardSvg id="ccd-c-evid" c={{ x: 720, y: 590, w: 210, h: 140, ...EVID }} />
      </svg>

      {/* vertical layout for phones */}
      <svg className="ccd-tall" viewBox="0 0 360 1350" role="img" aria-labelledby="ccd-title-tall">
        <title id="ccd-title-tall">How ColorConnect works, step by step from prepress to presses and people.</title>
        <Flow id="ccd-t-pre" d="M180 300 V360" label="jobs" lx={212} ly={334} />
        <Flow id="ccd-t-press" d="M180 500 V560" label="presets" back="live data" lx={236} ly={522} />
        <Flow id="ccd-t-people" d="M180 1010 V1050" dur={2} />
        <CardSvg id="ccd-m-pre" c={{ x: 10, y: 10, w: 340, h: 290, ...PRE }} />
        <Hub x={30} y={360} w={300} h={140} />
        <CardSvg id="ccd-m-off" c={{ x: 10, y: 560, w: 340, h: 250, ...OFF }} />
        <CardSvg id="ccd-m-flx" c={{ x: 10, y: 822, w: 340, h: 188, ...FLX }} />
        <CardSvg id="ccd-m-team" c={{ x: 10, y: 1050, w: 340, h: 90, ...TEAM, lines: [TEAM.lines.join(' ')] }} />
        <CardSvg id="ccd-m-cust" c={{ x: 10, y: 1150, w: 340, h: 90, ...CUST, lines: [CUST.lines.join(' ')] }} />
        <CardSvg id="ccd-m-evid" c={{ x: 10, y: 1250, w: 340, h: 90, ...EVID, lines: [EVID.lines.join(' ')] }} />
      </svg>
    </div>
  );
}
