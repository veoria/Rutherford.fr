// Extracts the full Rutherford Academy course content (metadata + lessons +
// quizzes) from the TypeScript data files into a single, editable Markdown
// document under docs/.
//
// The data files are plain data with type annotations, so we import them
// directly using Node's native type stripping. No build step or extra
// dependency required. Run with:
//   node scripts/extract-academy-courses.mjs
// (On Node 22.6–22.17, add the --experimental-strip-types flag.)

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'docs', 'academy-courses-content.md');

const { ALL_COURSES, FREE_COURSES } = await import('../data/academy-courses.ts');
const { COURSE_LESSONS } = await import('../data/academy-lessons.ts');
const { COURSE_QUIZZES } = await import('../data/academy-quizzes.ts');

const freeIds = new Set(FREE_COURSES.map((c) => c.id));
const letter = (i) => String.fromCharCode(65 + i); // 0 -> A

const lines = [];
const p = (s = '') => lines.push(s);

// ---- Header -----------------------------------------------------------------
p('# Rutherford Academy — contenu des cours');
p();
p('> Document de travail extrait automatiquement des sources :');
p('> `data/academy-courses.ts` (métadonnées + programme), `data/academy-lessons.ts` (leçons),');
p('> `data/academy-quizzes.ts` (quiz final).');
p('> Le texte des leçons et des quiz est repris **verbatim** depuis le code (en anglais).');
p('> Les intitulés de structure sont en français pour faciliter la réécriture.');
p('>');
p(`> Régénérer : \`node scripts/extract-academy-courses.mjs\``);
p();

// ---- Table of contents ------------------------------------------------------
p('## Sommaire');
p();
let n = 0;
for (const course of ALL_COURSES) {
  n += 1;
  const tag = freeIds.has(course.id) ? 'gratuit' : course.price ?? 'premium';
  const anchor = course.id;
  p(`${n}. [${course.title}](#${anchor}) — _${tag} · ${course.duration} · ${course.modules} modules_`);
}
p();
p('---');
p();

// ---- Courses ----------------------------------------------------------------
let freeHeaderDone = false;
let premiumHeaderDone = false;

n = 0;
for (const course of ALL_COURSES) {
  n += 1;
  const isFree = freeIds.has(course.id);

  if (isFree && !freeHeaderDone) {
    p('# Cours gratuits');
    p();
    freeHeaderDone = true;
  }
  if (!isFree && !premiumHeaderDone) {
    p('---');
    p();
    p('# Masterclasses premium');
    p();
    premiumHeaderDone = true;
  }

  p(`<a id="${course.id}"></a>`);
  p();
  p(`## ${n}. ${course.title}${course.flagship ? ' _(produit phare)_' : ''}`);
  p();

  // Metadata block
  const meta = [
    `**Durée** — ${course.duration}`,
    `**Modules** — ${course.modules}`,
    `**Prix** — ${isFree ? 'gratuit' : course.price ?? '—'}`,
  ];
  p(meta.join('  ·  '));
  p();
  p(`**Description** — ${course.description}`);
  p();
  if (course.certificate) {
    p(`**Certificat** — ${course.certificate}`);
    p();
  }
  p(`**Vidéo** — \`${course.videoSrc}\``);
  p(`**ID (slug)** — \`${course.id}\``);
  p();

  // Syllabus
  p('### Programme');
  p();
  course.syllabus.forEach((item, i) => p(`${i + 1}. ${item}`));
  p();

  // Lessons
  const lessons = COURSE_LESSONS[course.id] ?? [];
  p(`### Leçons (${lessons.length})`);
  p();
  lessons.forEach((lesson, i) => {
    p(`#### Leçon ${i + 1} — ${lesson.title}`);
    p();
    p(`_${lesson.summary}_`);
    p();
    lesson.body.forEach((para) => {
      p(para);
      p();
    });
  });

  // Quiz
  const quiz = COURSE_QUIZZES[course.id];
  if (quiz) {
    const pct = Math.round(quiz.passThreshold * 100);
    p(`### Quiz final — ${quiz.questions.length} questions · seuil de réussite ${pct} %`);
    p();
    quiz.questions.forEach((q, qi) => {
      const multi = q.correct.length > 1;
      p(`**Q${qi + 1}.** ${q.prompt}${multi ? '  _(plusieurs réponses)_' : ''}`);
      p();
      q.options.forEach((opt, oi) => {
        const ok = q.correct.includes(oi);
        p(`- ${letter(oi)}. ${opt}${ok ? '  ✅' : ''}`);
      });
      p();
      p(`> **Explication.** ${q.explanation}`);
      if (q.moduleRef) p(`> _(réf. module ${q.moduleRef})_`);
      p();
    });
  }

  p('---');
  p();
}

writeFileSync(OUT, lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n', 'utf8');

// Small console summary
const lessonCount = ALL_COURSES.reduce((a, c) => a + (COURSE_LESSONS[c.id]?.length ?? 0), 0);
const quizCount = ALL_COURSES.filter((c) => COURSE_QUIZZES[c.id]).length;
console.log(
  `Wrote ${OUT}\n  ${ALL_COURSES.length} courses · ${lessonCount} lessons · ${quizCount} quizzes`,
);
