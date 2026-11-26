// How ColorConnect works: ColorConnect on a MacBook in the middle, prepress files coming in, presets going
// out to an offset press with ColorLoop and a flexo press with DeltaOne, live data coming back, and the
// team following it on any screen. Data is drawn as moving dots: blue goes out, green comes back.
// Two layouts: a wide one from 900 px, a vertical one below.

const IMG = '/images/colorconnect';

type Item = {
  src: string;
  ratio: number; // width / height of the image
  title: string;
  lines: string[];
};

const PRE: Item = { src: 'diagram-prepress.webp', ratio: 625 / 587, title: 'Prepress', lines: ['PDF and CIP3 files dropped in a', 'folder become jobs, with their inks.'] };
const OFF: Item = { src: 'diagram-offset.webp', ratio: 1400 / 863, title: 'Offset presses', lines: ['ColorLoop at the console measures', 'the sheets and corrects the ink keys.'] };
const FLX: Item = { src: 'diagram-flexo.webp', ratio: 1400 / 699, title: 'Flexo and label presses', lines: ['DeltaOne measures every ink', 'inline, without stopping the press.'] };
const PPL: Item = { src: 'diagram-phone.webp', ratio: 548 / 1128, title: 'Your team and customers', lines: ['Every job live on any screen,', 'with PPWR evidence per job.'] };

const MAC = { src: 'device-macbook-jobs.webp', ratio: 1800 / 1184 };
const LOGO_RATIO = 1394 / 163;

// An illustration with its title and two lines centred under it. `bottom` is where the image ends.
function Piece({ it, cx, bottom, w, h, titleGap = 32 }: { it: Item; cx: number; bottom: number; w?: number; h?: number; titleGap?: number }) {
  const iw = w ?? (h as number) * it.ratio;
  const ih = h ?? (w as number) / it.ratio;
  const ty = bottom + titleGap;
  return (
    <g>
      <image href={`${IMG}/${it.src}`} x={cx - iw / 2} y={bottom - ih} width={iw} height={ih} />
      <text x={cx} y={ty} textAnchor="middle" className="ccd-title">
        {it.title}
      </text>
      {it.lines.map((l, i) => (
        <text key={l} x={cx} y={ty + 24 + i * 21} textAnchor="middle" className="ccd-line">
          {l}
        </text>
      ))}
    </g>
  );
}

// The MacBook running ColorConnect, with the logo and one line under it.
function Mac({ cx, top, w, lineY, lines }: { cx: number; top: number; w: number; lineY: number; lines: string[] }) {
  const h = w / MAC.ratio;
  const logoW = Math.min(230, w * 0.55);
  const logoH = logoW / LOGO_RATIO;
  const logoY = top + h + 24;
  return (
    <g>
      <image href={`${IMG}/${MAC.src}`} x={cx - w / 2} y={top} width={w} height={h} />
      <image href={`${IMG}/colorconnect.png`} x={cx - logoW / 2} y={logoY} width={logoW} height={logoH} />
      {lines.map((l, i) => (
        <text key={l} x={cx} y={lineY + i * 21} textAnchor="middle" className="ccd-hub-line">
          {l}
        </text>
      ))}
    </g>
  );
}

// A connector with dots travelling along it. `back` adds a green stream the other way.
function Flow({ d, id, back, dur = 2.8 }: { d: string; id: string; back?: boolean; dur?: number }) {
  return (
    <g>
      <path id={id} d={d} className="ccd-line-path" />
      {[0, 1, 2].map((k) => (
        <circle key={k} r={4.5} className="ccd-dot">
          <animateMotion dur={`${dur}s`} begin={`${(k * dur) / 3}s`} repeatCount="indefinite">
            <mpath href={`#${id}`} />
          </animateMotion>
        </circle>
      ))}
      {back &&
        [0, 1].map((k) => (
          <circle key={`b${k}`} r={4.5} className="ccd-dot ccd-dot-back">
            <animateMotion dur={`${dur}s`} begin={`${(k * dur) / 2 + dur / 4}s`} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
              <mpath href={`#${id}`} />
            </animateMotion>
          </circle>
        ))}
    </g>
  );
}

function Label({ x, y, text, back, anchor = 'middle' }: { x: number; y: number; text: string; back?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={back ? 'ccd-flow-label ccd-flow-back' : 'ccd-flow-label'}>
      {text}
    </text>
  );
}

export function ColorConnectDiagram() {
  return (
    <div className="ccd">
      {/* wide layout */}
      <svg className="ccd-wide" viewBox="0 0 1280 650" role="img" aria-labelledby="ccd-title-wide">
        <title id="ccd-title-wide">
          How ColorConnect works: ColorConnect runs on your own server. Prepress files become jobs, presets go to offset presses with ColorLoop and to flexo presses with DeltaOne, live data comes back, and your team and customers follow every job on any screen.
        </title>
        <Flow id="ccd-w-pre" d="M262 150 C362 150 352 262 452 262" />
        <Flow id="ccd-w-off" d="M832 262 C905 262 895 158 966 158" back />
        <Flow id="ccd-w-flx" d="M832 356 C905 356 895 516 962 516" back />
        <Flow id="ccd-w-ppl" d="M452 372 C350 372 345 482 210 482" dur={2.4} />
        <Label x={316} y={144} text="jobs" />
        <Label x={872} y={304} text="presets" />
        <Label x={872} y={322} text="live data" back />
        <Piece it={PRE} cx={150} bottom={244} w={200} />
        <Piece it={OFF} cx={1115} bottom={244} w={285} />
        <Piece it={PPL} cx={150} bottom={589} h={214} />
        <Piece it={FLX} cx={1115} bottom={589} w={295} />
        <Mac cx={640} top={148} w={470} lineY={548} lines={['Runs on your own server, in your print shop.']} />
      </svg>

      {/* vertical layout for phones */}
      <svg className="ccd-tall" viewBox="0 0 360 1520" role="img" aria-labelledby="ccd-title-tall">
        <title id="ccd-title-tall">How ColorConnect works, from prepress to the presses and back to your people.</title>
        <Flow id="ccd-t-pre" d="M180 268 V306" dur={1.6} />
        <Flow id="ccd-t-press" d="M180 634 V676" back dur={1.8} />
        <Flow id="ccd-t-ppl" d="M180 1208 V1248" dur={1.6} />
        <Label x={196} y={292} text="jobs" anchor="start" />
        <Label x={196} y={652} text="presets" anchor="start" />
        <Label x={196} y={670} text="live data" back anchor="start" />
        <Piece it={PRE} cx={180} bottom={182} w={176} titleGap={30} />
        <Mac cx={180} top={300} w={344} lineY={602} lines={['Runs on your own server,', 'in your print shop.']} />
        <Piece it={OFF} cx={180} bottom={862} w={300} titleGap={30} />
        <Piece it={FLX} cx={180} bottom={1120} w={310} titleGap={30} />
        <Piece it={PPL} cx={180} bottom={1430} h={176} titleGap={30} />
      </svg>
    </div>
  );
}
