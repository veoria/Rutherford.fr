-- Deal gagné dans Pipedrive → une tâche dans le projet Asana « Install ».
--
-- Cette table ne stocke rien de métier : c'est le registre qui garantit
-- qu'un deal ne produit **qu'une** carte Install. Pipedrive rejoue un webhook
-- tant qu'il ne reçoit pas de 2xx, un deal peut repasser en « gagné » après
-- avoir été perdu, et l'équipe peut basculer le statut plusieurs fois — donc
-- « gagné » n'est pas un événement unique. La clé primaire porte l'id du deal :
-- la deuxième livraison perd l'insert et le handler sait qu'il n'a rien à faire.
--
-- Écriture service-role uniquement (webhook). RLS activé sans aucune policy :
-- anon/authenticated ne lisent rien.

create table if not exists public.pipedrive_won_installs (
  deal_id bigint primary key,
  -- Titre du deal au moment du gain = nom de la tâche Asana
  -- (`Pays - Société - Machine - IDxxxx`). Conservé pour retrouver la carte
  -- même si le deal est renommé ensuite.
  deal_title text,
  -- Renseigné une fois la tâche créée ; la ligne est supprimée si la création
  -- échoue, pour qu'une nouvelle livraison puisse réessayer.
  asana_task_gid text,
  created_at timestamptz not null default now()
);

create index if not exists pipedrive_won_installs_created_at_idx
  on public.pipedrive_won_installs (created_at desc);

alter table public.pipedrive_won_installs enable row level security;
