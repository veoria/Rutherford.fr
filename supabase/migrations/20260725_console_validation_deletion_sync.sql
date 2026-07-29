-- Supprimer une tâche dans Asana masque la validation console côté client.
--
-- Cas d'usage : les demandes de test et les doublons. Le board Asana
-- « Console Validation V2 » est le poste de pilotage de l'équipe ; quand FX y
-- met une carte à la corbeille, la demande doit disparaître du suivi
-- /account/console-validations du client (et des vues revendeur), sans perdre
-- la ligne : c'est une suppression logique (deleted_at), réversible en
-- restaurant la tâche depuis la corbeille Asana (événement `undeleted`).
--
-- Écrit par le webhook Asana (service role). Les admins continuent de voir les
-- lignes masquées (filtre « Supprimées » du back-office) — seule la lecture
-- client / revendeur les exclut.

alter table public.console_validations
  add column if not exists deleted_at timestamptz,
  -- D'où vient la suppression : 'asana' aujourd'hui, laisse la place à un
  -- futur bouton back-office sans nouvelle migration.
  add column if not exists deleted_source text;

create index if not exists console_validations_deleted_at_idx
  on public.console_validations (deleted_at);

-- Lecture client : une ligne masquée n'est plus visible ni par son propriétaire,
-- ni par le revendeur, ni par la correspondance e-mail. La branche admin reste
-- inconditionnelle pour garder la trace consultable en back-office.
--
-- `(select auth.uid())` / `(select auth.jwt())` : forme déjà en place en base,
-- évaluée une fois par requête au lieu d'une fois par ligne (advisor
-- « auth_rls_initplan »). Ne pas la déplier en écrivant la policy.
alter policy "Console validations: self read" on public.console_validations
using (
  (
    deleted_at is null
    and (
      ((select auth.uid()) = user_id)
      or ((select auth.uid()) = reseller_id)
      or (
        user_id is null
        and lower(email) = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
      )
    )
  )
  or (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))
);

-- Le fil de conversation suit le sort de sa validation.
drop policy if exists "CV messages: self read" on public.console_validation_messages;
create policy "CV messages: self read" on public.console_validation_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.console_validations v
      where v.id = console_validation_messages.validation_id
        and (
          (
            v.deleted_at is null
            and (
              v.user_id = (select auth.uid())
              or v.reseller_id = (select auth.uid())
              or (
                v.user_id is null
                and lower(v.email) = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
              )
            )
          )
          or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin)
        )
    )
  );
