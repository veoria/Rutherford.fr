/**
 * Where the cover editor looks for photos. Shared by the listing route and the
 * file-streaming route so both agree on what is in bounds.
 *
 * `public/images` is served by Next directly. Everything else lives outside the
 * repo and is streamed through /api/dev/covers/file, which refuses any path
 * that does not sit under one of these roots. Add a folder here to expose it in
 * the editor.
 */

import { homedir } from 'node:os';
import { join, resolve, sep } from 'node:path';

const HOME = homedir();

export type ImageRoot = {
  /** Short id used in URLs and as the filter chip label. */
  id: string;
  label: string;
  dir: string;
  /** Served straight from /public rather than through the streaming route. */
  isPublic?: boolean;
};

export const IMAGE_ROOTS: ImageRoot[] = [
  {
    id: 'site',
    label: 'Site',
    dir: join(process.cwd(), 'public/images'),
    isPublic: true,
  },
  {
    id: 'cartonajes',
    label: 'Cartonajes shoot',
    dir: join(HOME, 'Downloads/Cartonajes Blog Rutherford'),
  },
  {
    id: 'blogphotos',
    label: 'Photo for blog',
    dir: join(HOME, 'Downloads/Photo for blog rutherford.fr'),
  },
  {
    id: 'assets',
    label: 'Assets',
    dir: join(process.cwd(), 'Assets for Website Rutherford.fr'),
  },
];

/** Resolves an absolute path and confirms it sits inside one of the roots. */
export function isInsideARoot(candidate: string): boolean {
  const target = resolve(candidate);
  return IMAGE_ROOTS.some((root) => {
    const base = resolve(root.dir);
    return target === base || target.startsWith(base + sep);
  });
}

export const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i;

export const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
};
