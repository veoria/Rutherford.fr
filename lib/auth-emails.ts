// Branded, localized auth emails (confirm signup, magic link, password reset,
// email change, reauthentication code). Sent from the Rutherford mailbox via
// the Send Email Hook (see app/api/auth/email/route.ts) instead of Supabase's
// plain default templates. Reuses the same HTML layout as the other Rutherford
// emails so the look is identical.

import { render } from '@/lib/console-validation-emails';

type AuthLocale = 'en' | 'fr' | 'de' | 'it' | 'es' | 'pt';
type ActionKey = 'signup' | 'magiclink' | 'recovery' | 'email_change' | 'reauthentication' | 'default';

type ActionCopy = {
  subject: string;
  eyebrow: string;
  tone: 'info' | 'ok' | 'warn' | 'no';
  headline: { pre: string; accent: string; post: string };
  /** Body paragraphs (trusted copy; may contain <strong>). '%CODE%' is replaced
   *  by the styled one-time code for the reauthentication mail. */
  body: string[];
  cta: string;
};

const SITE = 'https://rutherford.fr';
const ACCOUNT = `${SITE}/account`;

// Maps Supabase's email_action_type onto our copy keys.
function mapAction(raw: string): ActionKey {
  switch (raw) {
    case 'signup':
    case 'invite':
      return 'signup';
    case 'magiclink':
      return 'magiclink';
    case 'recovery':
      return 'recovery';
    case 'email_change':
    case 'email_change_current':
    case 'email_change_new':
      return 'email_change';
    case 'reauthentication':
      return 'reauthentication';
    default:
      return 'default';
  }
}

const COPY: Record<AuthLocale, Record<ActionKey, ActionCopy>> = {
  en: {
    signup: {
      subject: 'Confirm your email to finish creating your account',
      eyebrow: 'CONFIRM YOUR EMAIL',
      tone: 'info',
      headline: { pre: 'Confirm your email to ', accent: 'get started', post: '.' },
      body: [
        "You're one click from your Rutherford Academy account. Confirm your email address to activate it — then we'll help you complete your profile.",
        "If you didn't create this account, you can safely ignore this email.",
      ],
      cta: 'Confirm email address',
    },
    magiclink: {
      subject: 'Your sign-in link',
      eyebrow: 'SIGN-IN LINK',
      tone: 'info',
      headline: { pre: 'Your secure ', accent: 'sign-in link', post: '.' },
      body: [
        'Click the button below to sign in to your Rutherford account. The link is single-use and expires in one hour.',
        "If you didn't request it, you can ignore this email.",
      ],
      cta: 'Sign in',
    },
    recovery: {
      subject: 'Reset your password',
      eyebrow: 'PASSWORD RESET',
      tone: 'warn',
      headline: { pre: 'Reset your ', accent: 'password', post: '.' },
      body: [
        'We received a request to reset your Rutherford account password. Click below to choose a new one. The link expires in one hour.',
        "If you didn't request this, you can ignore this email — your password stays unchanged.",
      ],
      cta: 'Reset password',
    },
    email_change: {
      subject: 'Confirm your new email address',
      eyebrow: 'EMAIL CHANGE',
      tone: 'info',
      headline: { pre: 'Confirm your ', accent: 'new email', post: '.' },
      body: [
        'Confirm this address to finish updating the email on your Rutherford account.',
        "If you didn't request this change, please contact us.",
      ],
      cta: 'Confirm new email',
    },
    reauthentication: {
      subject: 'Your verification code',
      eyebrow: 'VERIFICATION CODE',
      tone: 'warn',
      headline: { pre: 'Your ', accent: 'verification code', post: '.' },
      body: [
        "Use this code to confirm it's you:",
        '%CODE%',
        "The code expires shortly. If you didn't request it, you can ignore this email.",
      ],
      cta: 'Go to your account',
    },
    default: {
      subject: 'Confirm your request',
      eyebrow: 'CONFIRM',
      tone: 'info',
      headline: { pre: 'Please ', accent: 'confirm', post: ' your request.' },
      body: ['Click the button below to continue.'],
      cta: 'Confirm',
    },
  },
  fr: {
    signup: {
      subject: 'Confirmez votre e-mail pour activer votre compte',
      eyebrow: 'CONFIRMEZ VOTRE E-MAIL',
      tone: 'info',
      headline: { pre: 'Confirmez votre e-mail pour ', accent: 'commencer', post: '.' },
      body: [
        "Vous êtes à un clic de votre compte Rutherford Academy. Confirmez votre adresse e-mail pour l'activer — nous vous aiderons ensuite à compléter votre profil.",
        "Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet e-mail.",
      ],
      cta: 'Confirmer mon e-mail',
    },
    magiclink: {
      subject: 'Votre lien de connexion',
      eyebrow: 'LIEN DE CONNEXION',
      tone: 'info',
      headline: { pre: 'Votre ', accent: 'lien de connexion', post: ' sécurisé.' },
      body: [
        'Cliquez sur le bouton ci-dessous pour vous connecter à votre compte Rutherford. Ce lien est à usage unique et expire dans une heure.',
        "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
      ],
      cta: 'Se connecter',
    },
    recovery: {
      subject: 'Réinitialisez votre mot de passe',
      eyebrow: 'RÉINITIALISATION',
      tone: 'warn',
      headline: { pre: 'Réinitialisez votre ', accent: 'mot de passe', post: '.' },
      body: [
        'Nous avons reçu une demande de réinitialisation du mot de passe de votre compte Rutherford. Cliquez ci-dessous pour en choisir un nouveau. Le lien expire dans une heure.',
        "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail — votre mot de passe reste inchangé.",
      ],
      cta: 'Réinitialiser le mot de passe',
    },
    email_change: {
      subject: 'Confirmez votre nouvelle adresse e-mail',
      eyebrow: "CHANGEMENT D'E-MAIL",
      tone: 'info',
      headline: { pre: 'Confirmez votre ', accent: 'nouvel e-mail', post: '.' },
      body: [
        "Confirmez cette adresse pour terminer la mise à jour de l'e-mail de votre compte Rutherford.",
        "Si vous n'êtes pas à l'origine de ce changement, contactez-nous.",
      ],
      cta: 'Confirmer le nouvel e-mail',
    },
    reauthentication: {
      subject: 'Votre code de vérification',
      eyebrow: 'CODE DE VÉRIFICATION',
      tone: 'warn',
      headline: { pre: 'Votre ', accent: 'code de vérification', post: '.' },
      body: [
        'Utilisez ce code pour confirmer votre identité :',
        '%CODE%',
        "Le code expire rapidement. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
      ],
      cta: 'Accéder à mon compte',
    },
    default: {
      subject: 'Confirmez votre demande',
      eyebrow: 'CONFIRMATION',
      tone: 'info',
      headline: { pre: 'Veuillez ', accent: 'confirmer', post: ' votre demande.' },
      body: ['Cliquez sur le bouton ci-dessous pour continuer.'],
      cta: 'Confirmer',
    },
  },
  de: {
    signup: {
      subject: 'Bestätigen Sie Ihre E-Mail, um Ihr Konto zu aktivieren',
      eyebrow: 'E-MAIL BESTÄTIGEN',
      tone: 'info',
      headline: { pre: 'Bestätigen Sie Ihre E-Mail, um ', accent: 'loszulegen', post: '.' },
      body: [
        'Sie sind nur einen Klick von Ihrem Rutherford-Academy-Konto entfernt. Bestätigen Sie Ihre E-Mail-Adresse, um es zu aktivieren — danach helfen wir Ihnen, Ihr Profil zu vervollständigen.',
        'Falls Sie dieses Konto nicht erstellt haben, können Sie diese E-Mail ignorieren.',
      ],
      cta: 'E-Mail-Adresse bestätigen',
    },
    magiclink: {
      subject: 'Ihr Anmeldelink',
      eyebrow: 'ANMELDELINK',
      tone: 'info',
      headline: { pre: 'Ihr sicherer ', accent: 'Anmeldelink', post: '.' },
      body: [
        'Klicken Sie auf die Schaltfläche unten, um sich bei Ihrem Rutherford-Konto anzumelden. Der Link ist einmalig gültig und läuft in einer Stunde ab.',
        'Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.',
      ],
      cta: 'Anmelden',
    },
    recovery: {
      subject: 'Setzen Sie Ihr Passwort zurück',
      eyebrow: 'PASSWORT ZURÜCKSETZEN',
      tone: 'warn',
      headline: { pre: 'Setzen Sie Ihr ', accent: 'Passwort', post: ' zurück.' },
      body: [
        'Wir haben eine Anfrage zum Zurücksetzen des Passworts Ihres Rutherford-Kontos erhalten. Klicken Sie unten, um ein neues zu wählen. Der Link läuft in einer Stunde ab.',
        'Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail — Ihr Passwort bleibt unverändert.',
      ],
      cta: 'Passwort zurücksetzen',
    },
    email_change: {
      subject: 'Bestätigen Sie Ihre neue E-Mail-Adresse',
      eyebrow: 'E-MAIL-ÄNDERUNG',
      tone: 'info',
      headline: { pre: 'Bestätigen Sie Ihre ', accent: 'neue E-Mail', post: '.' },
      body: [
        'Bestätigen Sie diese Adresse, um die Aktualisierung der E-Mail Ihres Rutherford-Kontos abzuschließen.',
        'Falls Sie diese Änderung nicht angefordert haben, kontaktieren Sie uns bitte.',
      ],
      cta: 'Neue E-Mail bestätigen',
    },
    reauthentication: {
      subject: 'Ihr Bestätigungscode',
      eyebrow: 'BESTÄTIGUNGSCODE',
      tone: 'warn',
      headline: { pre: 'Ihr ', accent: 'Bestätigungscode', post: '.' },
      body: [
        'Verwenden Sie diesen Code, um zu bestätigen, dass Sie es sind:',
        '%CODE%',
        'Der Code läuft bald ab. Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.',
      ],
      cta: 'Zum Konto',
    },
    default: {
      subject: 'Bestätigen Sie Ihre Anfrage',
      eyebrow: 'BESTÄTIGUNG',
      tone: 'info',
      headline: { pre: 'Bitte ', accent: 'bestätigen', post: ' Sie Ihre Anfrage.' },
      body: ['Klicken Sie auf die Schaltfläche unten, um fortzufahren.'],
      cta: 'Bestätigen',
    },
  },
  it: {
    signup: {
      subject: 'Confermi la sua e-mail per attivare il suo account',
      eyebrow: 'CONFERMA E-MAIL',
      tone: 'info',
      headline: { pre: 'Confermi la sua e-mail per ', accent: 'iniziare', post: '.' },
      body: [
        'È a un clic dal suo account Rutherford Academy. Confermi il suo indirizzo e-mail per attivarlo — poi la aiuteremo a completare il suo profilo.',
        'Se non ha creato lei questo account, può ignorare questa e-mail.',
      ],
      cta: "Conferma l'e-mail",
    },
    magiclink: {
      subject: 'Il suo link di accesso',
      eyebrow: 'LINK DI ACCESSO',
      tone: 'info',
      headline: { pre: 'Il suo ', accent: 'link di accesso', post: ' sicuro.' },
      body: [
        "Clicchi sul pulsante qui sotto per accedere al suo account Rutherford. Il link è monouso e scade tra un'ora.",
        "Se non ha richiesto lei l'accesso, ignori questa e-mail.",
      ],
      cta: 'Accedi',
    },
    recovery: {
      subject: 'Reimposti la sua password',
      eyebrow: 'REIMPOSTAZIONE PASSWORD',
      tone: 'warn',
      headline: { pre: 'Reimposti la sua ', accent: 'password', post: '.' },
      body: [
        "Abbiamo ricevuto una richiesta di reimpostazione della password del suo account Rutherford. Clicchi qui sotto per sceglierne una nuova. Il link scade tra un'ora.",
        'Se non ha effettuato lei la richiesta, ignori questa e-mail — la sua password resta invariata.',
      ],
      cta: 'Reimposta la password',
    },
    email_change: {
      subject: 'Confermi il suo nuovo indirizzo e-mail',
      eyebrow: 'CAMBIO E-MAIL',
      tone: 'info',
      headline: { pre: 'Confermi la sua ', accent: 'nuova e-mail', post: '.' },
      body: [
        "Confermi questo indirizzo per completare l'aggiornamento dell'e-mail del suo account Rutherford.",
        'Se non ha richiesto lei questa modifica, ci contatti.',
      ],
      cta: 'Conferma la nuova e-mail',
    },
    reauthentication: {
      subject: 'Il suo codice di verifica',
      eyebrow: 'CODICE DI VERIFICA',
      tone: 'warn',
      headline: { pre: 'Il suo ', accent: 'codice di verifica', post: '.' },
      body: [
        'Usi questo codice per confermare la sua identità:',
        '%CODE%',
        'Il codice scade a breve. Se non ha effettuato lei la richiesta, ignori questa e-mail.',
      ],
      cta: 'Vai al mio account',
    },
    default: {
      subject: 'Confermi la sua richiesta',
      eyebrow: 'CONFERMA',
      tone: 'info',
      headline: { pre: 'La preghiamo di ', accent: 'confermare', post: ' la sua richiesta.' },
      body: ['Clicchi sul pulsante qui sotto per continuare.'],
      cta: 'Conferma',
    },
  },
  es: {
    signup: {
      subject: 'Confirme su correo para activar su cuenta',
      eyebrow: 'CONFIRME SU CORREO',
      tone: 'info',
      headline: { pre: 'Confirme su correo para ', accent: 'empezar', post: '.' },
      body: [
        'Está a un clic de su cuenta de Rutherford Academy. Confirme su dirección de correo para activarla; después le ayudaremos a completar su perfil.',
        'Si no ha creado usted esta cuenta, puede ignorar este correo.',
      ],
      cta: 'Confirmar mi correo',
    },
    magiclink: {
      subject: 'Su enlace de acceso',
      eyebrow: 'ENLACE DE ACCESO',
      tone: 'info',
      headline: { pre: 'Su ', accent: 'enlace de acceso', post: ' seguro.' },
      body: [
        'Haga clic en el botón de abajo para iniciar sesión en su cuenta de Rutherford. El enlace es de un solo uso y caduca en una hora.',
        'Si no ha solicitado el acceso, ignore este correo.',
      ],
      cta: 'Iniciar sesión',
    },
    recovery: {
      subject: 'Restablezca su contraseña',
      eyebrow: 'RESTABLECER CONTRASEÑA',
      tone: 'warn',
      headline: { pre: 'Restablezca su ', accent: 'contraseña', post: '.' },
      body: [
        'Hemos recibido una solicitud para restablecer la contraseña de su cuenta de Rutherford. Haga clic abajo para elegir una nueva. El enlace caduca en una hora.',
        'Si no ha realizado usted la solicitud, ignore este correo: su contraseña no cambiará.',
      ],
      cta: 'Restablecer contraseña',
    },
    email_change: {
      subject: 'Confirme su nueva dirección de correo',
      eyebrow: 'CAMBIO DE CORREO',
      tone: 'info',
      headline: { pre: 'Confirme su ', accent: 'nuevo correo', post: '.' },
      body: [
        'Confirme esta dirección para completar la actualización del correo de su cuenta de Rutherford.',
        'Si no ha solicitado usted este cambio, contáctenos.',
      ],
      cta: 'Confirmar el nuevo correo',
    },
    reauthentication: {
      subject: 'Su código de verificación',
      eyebrow: 'CÓDIGO DE VERIFICACIÓN',
      tone: 'warn',
      headline: { pre: 'Su ', accent: 'código de verificación', post: '.' },
      body: [
        'Use este código para confirmar que es usted:',
        '%CODE%',
        'El código caduca en breve. Si no ha realizado usted la solicitud, ignore este correo.',
      ],
      cta: 'Ir a mi cuenta',
    },
    default: {
      subject: 'Confirme su solicitud',
      eyebrow: 'CONFIRMACIÓN',
      tone: 'info',
      headline: { pre: 'Por favor, ', accent: 'confirme', post: ' su solicitud.' },
      body: ['Haga clic en el botón de abajo para continuar.'],
      cta: 'Confirmar',
    },
  },
  pt: {
    signup: {
      subject: 'Confirme o seu email para ativar a sua conta',
      eyebrow: 'CONFIRME O SEU EMAIL',
      tone: 'info',
      headline: { pre: 'Confirme o seu email para ', accent: 'começar', post: '.' },
      body: [
        'Está a um clique da sua conta Rutherford Academy. Confirme o seu endereço de email para a ativar e, em seguida, ajudamos a completar o seu perfil.',
        'Se não foi quem criou esta conta, pode ignorar este email.',
      ],
      cta: 'Confirmar o meu email',
    },
    magiclink: {
      subject: 'A sua ligação de acesso',
      eyebrow: 'LIGAÇÃO DE ACESSO',
      tone: 'info',
      headline: { pre: 'A sua ', accent: 'ligação de acesso', post: ' segura.' },
      body: [
        'Clique no botão abaixo para iniciar sessão na sua conta Rutherford. A ligação é de utilização única e expira numa hora.',
        'Se não solicitou isto, pode ignorar este email.',
      ],
      cta: 'Iniciar sessão',
    },
    recovery: {
      subject: 'Reponha a sua palavra-passe',
      eyebrow: 'REPOR A PALAVRA-PASSE',
      tone: 'warn',
      headline: { pre: 'Reponha a sua ', accent: 'palavra-passe', post: '.' },
      body: [
        'Recebemos um pedido para repor a palavra-passe da sua conta Rutherford. Clique abaixo para escolher uma nova. A ligação expira numa hora.',
        'Se não solicitou isto, pode ignorar este email. A sua palavra-passe permanece inalterada.',
      ],
      cta: 'Repor a palavra-passe',
    },
    email_change: {
      subject: 'Confirme o seu novo endereço de email',
      eyebrow: 'ALTERAÇÃO DE EMAIL',
      tone: 'info',
      headline: { pre: 'Confirme o seu ', accent: 'novo email', post: '.' },
      body: [
        'Confirme este endereço para concluir a atualização do email da sua conta Rutherford.',
        'Se não solicitou esta alteração, contacte-nos.',
      ],
      cta: 'Confirmar o novo email',
    },
    reauthentication: {
      subject: 'O seu código de verificação',
      eyebrow: 'CÓDIGO DE VERIFICAÇÃO',
      tone: 'warn',
      headline: { pre: 'O seu ', accent: 'código de verificação', post: '.' },
      body: [
        'Utilize este código para confirmar a sua identidade:',
        '%CODE%',
        'O código expira em breve. Se não solicitou isto, pode ignorar este email.',
      ],
      cta: 'Aceder à minha conta',
    },
    default: {
      subject: 'Confirme o seu pedido',
      eyebrow: 'CONFIRMAÇÃO',
      tone: 'info',
      headline: { pre: 'Por favor, ', accent: 'confirme', post: ' o seu pedido.' },
      body: ['Clique no botão abaixo para continuar.'],
      cta: 'Confirmar',
    },
  },
};

const LOCALES = ['en', 'fr', 'de', 'it', 'es', 'pt'] as const;

// One-time code block for the reauthentication mail.
const CODE_STYLE =
  "font-family:'JetBrains Mono','Courier New',monospace;display:block;font-size:30px;font-weight:700;letter-spacing:.34em;color:#181410;background:#F1EFEA;border-radius:10px;padding:16px 8px 16px 18px;text-align:center;margin:4px 0;";

const escDigits = (value: string) => value.replace(/[^0-9A-Za-z -]/g, '');

export function authEmail(opts: {
  action: string;
  locale?: string | null;
  url: string;
  token?: string | null;
}): { subject: string; html: string } {
  const loc: AuthLocale = (LOCALES as readonly string[]).includes(opts.locale ?? '')
    ? (opts.locale as AuthLocale)
    : 'en';
  const key = mapAction(opts.action);
  const c = COPY[loc][key];
  const body = c.body.map((p) =>
    p === '%CODE%' ? `<span style="${CODE_STYLE}">${escDigits(opts.token ?? '')}</span>` : p
  );
  return {
    subject: c.subject,
    html: render({
      subject: c.subject,
      preheader: c.subject,
      eyebrow: c.eyebrow,
      tone: c.tone,
      transactional: true,
      headline: c.headline,
      body,
      cta: { label: c.cta, href: key === 'reauthentication' ? ACCOUNT : opts.url },
    }),
  };
}
