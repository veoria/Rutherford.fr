// How ColorConnect works. In the middle, a MacBook showing the live press floor. Prepress files come in,
// presets go out to an offset press with ColorLoop and a flexo press with DeltaOne, live data comes back,
// and the team and customers follow it. Presses are side-view line drawings, people and files are Phosphor
// icons. Data is drawn as moving dots: blue goes out, green comes back. Wide layout from 900 px, vertical below.

import { FlexoSchematic, OffsetSchematic } from './colorconnect-presses';
import { PH } from './colorconnect-phosphor';

const IMG = '/images/colorconnect';
const MAC_RATIO = 1800 / 1184;
const LOGO_RATIO = 1394 / 163;

function Icon({ name, cx, cy, r, size }: { name: string; cx: number; cy: number; r: number; size: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} className="ccd-ico-bg" />
      <g transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 256})`} className="ccd-ico" dangerouslySetInnerHTML={{ __html: PH[name] }} />
    </g>
  );
}

function Caption({ cx, y, title, lines }: { cx: number; y: number; title: string; lines: string[] }) {
  return (
    <g>
      <text x={cx} y={y} textAnchor="middle" className="ccd-title">
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={l} x={cx} y={y + 24 + i * 21} textAnchor="middle" className="ccd-line">
          {l}
        </text>
      ))}
    </g>
  );
}

function Tag({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" className="ccd-tag">
      {text}
    </text>
  );
}

function Mac({ cx, top, w, lineY, lines }: { cx: number; top: number; w: number; lineY: number; lines: string[] }) {
  const h = w / MAC_RATIO;
  const logoW = Math.min(220, w * 0.5);
  return (
    <g>
      <image href={`${IMG}/diagram-mac-floor.webp`} x={cx - w / 2} y={top} width={w} height={h} />
      <image href={`${IMG}/colorconnect.png`} x={cx - logoW / 2} y={top + h + 22} width={logoW} height={logoW / LOGO_RATIO} />
      {lines.map((l, i) => (
        <text key={l} x={cx} y={lineY + i * 21} textAnchor="middle" className="ccd-hub-line">
          {l}
        </text>
      ))}
    </g>
  );
}

function Flow({ d, id, back, dur = 2.8 }: { d: string; id: string; back?: boolean; dur?: number }) {
  return (
    <g>
      <path id={id} d={d} className="ccd-line-path" />
      {[0, 1, 2].map((k) => (
        <circle key={k} r={4.5} className="ccd-dot">
          <animateMotion dur={`${dur}s`} begin={`-${(k * dur) / 3}s`} repeatCount="indefinite">
            <mpath href={`#${id}`} />
          </animateMotion>
        </circle>
      ))}
      {back &&
        [0, 1].map((k) => (
          <circle key={`b${k}`} r={4.5} className="ccd-dot ccd-dot-back">
            <animateMotion dur={`${dur}s`} begin={`-${(k * dur) / 2 + dur / 4}s`} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
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

const T = {
  pre: { title: 'Prepress', lines: ['PDF and CIP3 files dropped in a', 'folder become jobs, with their inks.'] },
  off: { title: 'Offset presses', lines: ['ColorLoop at the console measures', 'the sheets and corrects the ink keys.'] },
  flx: { title: 'Flexo and label presses', lines: ['DeltaOne measures every ink', 'inline, without stopping the press.'] },
  ppl: { title: 'Your team and customers', lines: ['Every job live on any screen,', 'with PPWR evidence per job.'] },
};

export function ColorConnectDiagram() {
  return (
    <div className="ccd">
      {/* wide layout */}
      <svg className="ccd-wide" viewBox="0 0 1280 620" role="img" aria-labelledby="ccd-title-wide">
        <title id="ccd-title-wide">
          How ColorConnect works: ColorConnect runs on your own server and shows the live press floor. Prepress files become jobs, presets go to offset presses with ColorLoop and to flexo presses with DeltaOne, live data comes back, and your team and customers follow every job.
        </title>
        <Flow id="ccd-w-pre" d="M210 148 C330 148 330 250 452 250" />
        <Flow id="ccd-w-off" d="M808 250 C870 250 866 140 924 140" back />
        <Flow id="ccd-w-flx" d="M808 330 C870 330 866 468 924 468" back />
        <Flow id="ccd-w-ppl" d="M452 340 C350 340 340 470 248 470" dur={2.4} />
        <Label x={300} y={168} text="jobs" />
        <Label x={852} y={290} text="presets" />
        <Label x={852} y={308} text="live data" back />

        <Icon name="filePdf" cx={150} cy={148} r={58} size={64} />
        <Caption cx={150} y={246} {...T.pre} />

        <Mac cx={630} top={140} w={460} lineY={530} lines={['Runs on your own server, in your print shop.']} />

        <OffsetSchematic x={930} y={80} w={330} id="ccd-w-sheet" />
        <Tag x={947} y={214} text="ColorLoop" />
        <Caption cx={1095} y={246} {...T.off} />

        <FlexoSchematic x={930} y={420} w={330} id="ccd-w-web" />
        <Tag x={1223} y={530} text="DeltaOne" />
        <Caption cx={1095} y={562} {...T.flx} />

        <Icon name="usersThree" cx={104} cy={470} r={44} size={50} />
        <Icon name="handshake" cx={196} cy={470} r={44} size={50} />
        <Caption cx={150} y={562} {...T.ppl} />
      </svg>

      {/* vertical layout for phones */}
      <svg className="ccd-tall" viewBox="0 0 360 1290" role="img" aria-labelledby="ccd-title-tall">
        <title id="ccd-title-tall">How ColorConnect works, from prepress to the presses and back to your people.</title>
        <Flow id="ccd-t-pre" d="M180 200 V244" dur={1.6} />
        <Flow id="ccd-t-press" d="M180 576 V624" back dur={1.8} />
        <Flow id="ccd-t-ppl" d="M180 1074 V1104" dur={1.6} />
        <Label x={196} y={227} text="jobs" anchor="start" />
        <Label x={196} y={596} text="presets" anchor="start" />
        <Label x={196} y={614} text="live data" back anchor="start" />

        <Icon name="filePdf" cx={180} cy={58} r={46} size={52} />
        <Caption cx={180} y={136} {...T.pre} />

        <Mac cx={180} top={240} w={344} lineY={530} lines={['Runs on your own server,', 'in your print shop.']} />

        <OffsetSchematic x={15} y={640} w={330} id="ccd-t-sheet" />
        <Tag x={32} y={774} text="ColorLoop" />
        <Caption cx={180} y={804} {...T.off} />

        <FlexoSchematic x={15} y={880} w={330} id="ccd-t-web" />
        <Tag x={308} y={990} text="DeltaOne" />
        <Caption cx={180} y={1016} {...T.flx} />

        <Icon name="usersThree" cx={138} cy={1146} r={38} size={44} />
        <Icon name="handshake" cx={222} cy={1146} r={38} size={44} />
        <Caption cx={180} y={1218} {...T.ppl} />
      </svg>
    </div>
  );
}
