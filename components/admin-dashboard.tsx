'use client';

import { useMemo, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import type { AdminOverview, AdminUser } from '@/lib/admin';

function fmtDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function toCsv(users: AdminUser[]): string {
  const headers = [
    'Nom', 'Email', 'Société', 'Pays', 'Poste', 'Admin', 'Onboardé', 'Inscrit', 'Dernière activité',
    'Modules terminés', 'Cours terminés', 'Certificats', 'Niveau', 'XP', 'Série', 'Pass actif', 'Achats',
  ];
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = users.map((u) =>
    [
      u.name, u.email, u.company, u.country, u.jobTitle, u.isAdmin ? 'oui' : '', u.onboarded ? 'oui' : '',
      u.signupAt ? new Date(u.signupAt).toISOString().slice(0, 10) : '',
      u.lastActiveAt ? new Date(u.lastActiveAt).toISOString().slice(0, 10) : '',
      u.modulesCompleted, u.coursesCompleted, u.certificates, u.level, u.xp, u.streak,
      u.activePass ? 'oui' : '', u.purchases,
    ]
      .map(cell)
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export function AdminDashboard({ overview }: { overview: AdminOverview }) {
  const { users, courses, totals } = overview;
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.company, u.country, u.jobTitle].some((f) => (f ?? '').toLowerCase().includes(q))
    );
  }, [users, query]);

  const downloadCsv = () => {
    const blob = new Blob(['﻿' + toCsv(users)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rutherford-academy-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="page-shell" id="top">
      <SiteNav />

      <section className="admin-section section">
        <div className="container">
          <header className="admin-head">
            <div>
              <p className="section-kicker">Admin · Rutherford Academy</p>
              <h1 className="admin-title">Tableau de bord</h1>
            </div>
            <button type="button" className="button button-light" onClick={downloadCsv}>
              Exporter en CSV
            </button>
          </header>

          <ul className="admin-totals">
            <li className="admin-total">
              <span className="admin-total-value">{totals.users}</span>
              <span className="admin-total-label">Comptes</span>
            </li>
            <li className="admin-total">
              <span className="admin-total-value">{totals.onboarded}</span>
              <span className="admin-total-label">Onboardés (leads)</span>
            </li>
            <li className="admin-total">
              <span className="admin-total-value">{totals.certificates}</span>
              <span className="admin-total-label">Certificats délivrés</span>
            </li>
            <li className="admin-total">
              <span className="admin-total-value">{totals.activePass}</span>
              <span className="admin-total-label">Academy Pass actifs</span>
            </li>
          </ul>

          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Utilisateurs ({filtered.length})</h2>
              <input
                type="search"
                className="admin-search"
                placeholder="Rechercher (nom, e-mail, société…)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>E-mail</th>
                    <th>Société</th>
                    <th>Pays</th>
                    <th>Poste</th>
                    <th>Inscrit</th>
                    <th>Dern. activité</th>
                    <th className="admin-num">Modules</th>
                    <th className="admin-num">Cours</th>
                    <th className="admin-num">Certif.</th>
                    <th className="admin-num">Niv.</th>
                    <th className="admin-num">Série</th>
                    <th>Accès</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id}>
                      <td>
                        {u.name ?? '—'}
                        {u.isAdmin ? <span className="admin-badge">admin</span> : null}
                      </td>
                      <td className="admin-email">{u.email}</td>
                      <td>{u.company ?? '—'}</td>
                      <td>{u.country ?? '—'}</td>
                      <td>{u.jobTitle ?? '—'}</td>
                      <td>{fmtDate(u.signupAt)}</td>
                      <td>{fmtDate(u.lastActiveAt)}</td>
                      <td className="admin-num">{u.modulesCompleted}</td>
                      <td className="admin-num">{u.coursesCompleted}</td>
                      <td className="admin-num">{u.certificates}</td>
                      <td className="admin-num">{u.level}</td>
                      <td className="admin-num">{u.streak}</td>
                      <td>
                        {u.activePass ? 'Pass' : u.purchases > 0 ? `${u.purchases} achat(s)` : u.onboarded ? 'Gratuit' : '—'}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="admin-empty">
                        Aucun utilisateur.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Par cours</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cours</th>
                    <th>Type</th>
                    <th className="admin-num">Apprenants</th>
                    <th className="admin-num">Certifiés</th>
                    <th className="admin-num">Score moyen QCM</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.slug}>
                      <td>{c.title}</td>
                      <td>{c.tone === 'premium' ? 'Premium' : 'Gratuit'}</td>
                      <td className="admin-num">{c.learners}</td>
                      <td className="admin-num">{c.certified}</td>
                      <td className="admin-num">{c.avgQuizPct != null ? `${c.avgQuizPct}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
