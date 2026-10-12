import React, { useState } from 'react';
import {
  ShieldAlert,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  X,
  FileText,
  AlertTriangle,
  Lock,
  Database,
  Building2,
  HelpCircle,
  Award
} from 'lucide-react';
import { AppLogo } from './AppLogo';

interface LegalMentionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'en';
}

export const LegalMentionsModal: React.FC<LegalMentionsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isFr = lang === 'fr';
  const [activeTab, setActiveTab] = useState<'disclaimer' | 'editeur' | 'rgpd' | 'ip' | 'responsibility'>('disclaimer');
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  const disclaimerTextFr = `AVIS D'INDÉPENDANCE & MENTIONS LÉGALES — DBMASTERY STUDIO

1. ABSENCE DE LIEN AVEC LES ÉDITEURS TIERS (ORACLE, AZURE, POSTGRESQL, MYSQL) :
DBMastery Studio est une plateforme d'apprentissage, d'entraînement technique et de diagnostic de compétences totalement indépendante.
L'application et son créateur n'ont AUCUN LIEN, AUCUNE AFFILIATION, AUCUN PARTENARIAT, AUCUN PARRAINAGE NI AUCUN AGRÉMENT OFFICIEL avec :
- Oracle Corporation
- Microsoft Corporation (Microsoft Azure)
- PostgreSQL Community Association of Canada / The PostgreSQL Global Development Group / EnterpriseDB (EDB)
- MySQL (Oracle Corporation)

2. USAGE LOYAL DES MARQUES ET NOMS D'EXAMENS (FAIR USE) :
Les marques déposées « Oracle® », « Oracle Database® », « Microsoft® », « Microsoft Azure® », « Azure SQL® », « PostgreSQL® », « MySQL® », ainsi que les dénominations officielles des certifications et examens (1Z0-071, DP-900, DP-800, DP-300, EDB PostgreSQL Associate 16, MySQL 8.0 1Z0-908) sont la propriété exclusive de leurs détenteurs légaux respectifs.
Leur mention dans DBMastery Studio a pour unique objet d'orienter les apprenants dans leur parcours d'auto-formation, de classifier pédagogiquement les compétences SQL et de préparer de manière autonome les épreuves techniques.

3. VOCATION PÉDAGOGIQUE ET ABSENCE DE VALEUR DIPLÔMANTE :
DBMastery Studio est un outil pédagogique complémentaire. L'obtention de scores d'évaluation ou de badges sur cette plateforme ne constitue pas une certification officielle et ne saurait garantir le succès aux examens délivrés par les organismes certificateurs officiels.

4. DONNÉES PERSONNELLES & RGPD :
L'application fonctionne localement par défaut dans votre navigateur (localStorage). Aucune donnée n'est revendue à des tiers. En cas de synchronisation optionnelle via Google Auth (Firestore), seules les informations publiques de profil et la progression d'apprentissage sont stockées sur des serveurs sécurisés. Vous disposez d'un droit de réinitialisation intégrale de vos données en un clic via les Paramètres Système.`;

  const disclaimerTextEn = `INDEPENDENCE NOTICE & LEGAL DISCLAIMER — DBMASTERY STUDIO

1. NO AFFILIATION WITH THIRD-PARTY VENDORS (ORACLE, AZURE, POSTGRESQL, MYSQL):
DBMastery Studio is an independent educational and technical training studio.
The platform and its author have NO AFFILIATION, NO ENDORSEMENT, NO SPONSORSHIP, AND NO OFFICIAL PARTNERSHIP with:
- Oracle Corporation
- Microsoft Corporation (Microsoft Azure)
- PostgreSQL Community Association of Canada / PostgreSQL Global Development Group / EnterpriseDB (EDB)
- MySQL (Oracle Corporation)

2. FAIR USE OF TRADEMARKS AND EXAM IDENTIFIERS:
Trademarks such as "Oracle®", "Oracle Database®", "Microsoft®", "Microsoft Azure®", "Azure SQL®", "PostgreSQL®", "MySQL®", as well as exam codes (1Z0-071, DP-900, DP-800, DP-300, EDB PostgreSQL Associate 16, MySQL 8.0 1Z0-908) belong solely to their respective trademark holders.
Their reference within DBMastery Studio is strictly for educational guidance, competency alignment, and curriculum identification (Nominative Fair Use).

3. EDUCATIONAL SCOPE & NON-CERTIFYING STATUS:
DBMastery Studio is a self-study complementary simulator. Earning badges or mastery scores on this platform does not grant official vendor certifications.

4. PRIVACY & GDPR COMPLIANCE:
Data is stored locally in your browser by default. With optional Google Sign-In (Firestore), only basic profile info and mastery metrics are synchronized securely. You can reset all your stored metrics anytime via System Settings.`;

  const handleCopy = () => {
    const textToCopy = isFr ? disclaimerTextFr : disclaimerTextEn;
    navigator.clipboard.writeText(textToCopy);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  return (
    <div
      id="legal-mentions-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="legal-mentions-modal"
        className="relative w-full max-w-4xl my-auto rounded-2xl bg-[#09182a] border border-[#38bdf8]/40 text-[#d3e4fe] shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#031120] border-b border-[#1b2b3f] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#002b4d] border border-[#38bdf8]/50 flex items-center justify-center text-[#38bdf8] shadow-inner">
              <Scale className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#0284c7]/20 border border-[#38bdf8]/40 text-[#38bdf8]">
                  {isFr ? 'Mentions Légales & Droits' : 'Legal Notice & Rights'}
                </span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 text-[#4edea3]">
                  {isFr ? 'Avis d’Indépendance' : 'Independent Platform'}
                </span>
              </div>
              <h2 className="text-xl font-black text-[#d3e4fe] tracking-tight">
                {isFr ? 'Mentions Légales & Propriété Intellectuelle' : 'Legal Notices & Trademark Disclaimer'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] text-xs font-mono text-[#89ceff] transition-colors"
              title={isFr ? 'Copier la déclaration légale' : 'Copy legal disclaimer'}
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#4edea3]" />
                  <span className="text-[#4edea3]">{isFr ? 'Copié !' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Copier' : 'Copy'}</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#89929b] hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Highlight Banner: EXPLICIT ZERO-AFFILIATION NOTICE */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#170a00] via-[#1f1505] to-[#0a1a2e] border-b border-[#f59e0b]/40">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#f59e0b]/20 border border-[#f59e0b]/50 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-[#fbbf24]" />
            </div>
            <div className="flex flex-col gap-1 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-extrabold uppercase font-mono tracking-wider text-[#fbbf24] text-xs">
                  {isFr ? 'Déclaration Formelle d’Indépendance' : 'Formal Independence Statement'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f59e0b]/20 text-[#fde047] font-bold">
                  {isFr ? 'Aucun lien officiel' : 'No Official Affiliation'}
                </span>
              </div>
              <p className="text-[#fef08a] font-semibold leading-relaxed">
                {isFr
                  ? "DBMastery Studio est une initiative pédagogique indépendante. L'auteur et l'application ne possèdent aucun lien, partenariat, parrainage ni affiliation officielle avec Oracle Corporation, Microsoft Azure, PostgreSQL Global Development Group ou MySQL."
                  : 'DBMastery Studio is an independent educational simulator. The author and the platform have no affiliation, partnership, sponsorship, or official endorsement with Oracle Corporation, Microsoft Azure, PostgreSQL Global Development Group, or MySQL.'}
              </p>
              <p className="text-[#fcd34d]/80 text-[11px] leading-relaxed">
                {isFr
                  ? 'Toutes les marques commerciales, dénominations de produits et codes de certifications (1Z0-071, DP-900, DP-800, EDB Associate, 1Z0-908) demeurent la propriété exclusive de leurs éditeurs respectifs.'
                  : 'All trademarks, product names, and certification exam codes (1Z0-071, DP-900, DP-800, EDB Associate, 1Z0-908) are the exclusive property of their respective trademark holders.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-[#061322] border-b border-[#1b2b3f] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`pb-3 px-3 text-xs font-mono font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'disclaimer'
                ? 'border-[#38bdf8] text-[#38bdf8]'
                : 'border-transparent text-[#89929b] hover:text-[#d3e4fe]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isFr ? '1. Absence de lien (Oracle, Azure, etc.)' : '1. Independence & Brands'}</span>
          </button>
          <button
            onClick={() => setActiveTab('editeur')}
            className={`pb-3 px-3 text-xs font-mono font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'editeur'
                ? 'border-[#38bdf8] text-[#38bdf8]'
                : 'border-transparent text-[#89929b] hover:text-[#d3e4fe]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isFr ? '2. Éditeur & Objet Pédagogique' : '2. Publisher & Objective'}</span>
          </button>
          <button
            onClick={() => setActiveTab('ip')}
            className={`pb-3 px-3 text-xs font-mono font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'ip'
                ? 'border-[#38bdf8] text-[#38bdf8]'
                : 'border-transparent text-[#89929b] hover:text-[#d3e4fe]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isFr ? '3. Propriété Intellectuelle (Fair Use)' : '3. Intellectual Property'}</span>
          </button>
          <button
            onClick={() => setActiveTab('rgpd')}
            className={`pb-3 px-3 text-xs font-mono font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'rgpd'
                ? 'border-[#38bdf8] text-[#38bdf8]'
                : 'border-transparent text-[#89929b] hover:text-[#d3e4fe]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isFr ? '4. Confidentialité & RGPD' : '4. Privacy & GDPR'}</span>
          </button>
          <button
            onClick={() => setActiveTab('responsibility')}
            className={`pb-3 px-3 text-xs font-mono font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'responsibility'
                ? 'border-[#38bdf8] text-[#38bdf8]'
                : 'border-transparent text-[#89929b] hover:text-[#d3e4fe]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isFr ? '5. Responsabilité & Conseils' : '5. Disclaimer of Warranty'}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-[#bfc7d2] leading-relaxed">
          {/* TAB 1: DISCLAIMER ORACLE, AZURE, POSTGRESQL, MYSQL */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 text-[#4edea3] font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-[#4edea3]" />
                <h3>{isFr ? 'Précision formelle concernant chaque technologie citée' : 'Technology-by-technology clarification'}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Oracle */}
                <div className="p-4 rounded-xl bg-[#061322] border border-[#ef4444]/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-[#ef4444] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
                      Oracle Database & 1Z0-071
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ef4444]/20 text-[#fca5a5]">
                      {isFr ? 'Indépendant' : 'Independent'}
                    </span>
                  </div>
                  <p className="text-xs text-[#d3e4fe]">
                    {isFr
                      ? "DBMastery Studio n'a aucun lien avec Oracle Corporation ni avec Oracle University. Oracle, Java et MySQL sont des marques déposées d'Oracle Corporation et/ou de ses filiales. Le code d'examen 1Z0-071 n'est cité qu'à des fins de révision."
                      : 'DBMastery Studio has no affiliation with Oracle Corporation or Oracle University. Oracle, Java, and MySQL are registered trademarks of Oracle Corporation and/or its affiliates.'}
                  </p>
                </div>

                {/* Microsoft Azure */}
                <div className="p-4 rounded-xl bg-[#061322] border border-[#0284c7]/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-[#38bdf8] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span>
                      Microsoft Azure (DP-900 / DP-800)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0284c7]/20 text-[#93ccff]">
                      {isFr ? 'Indépendant' : 'Independent'}
                    </span>
                  </div>
                  <p className="text-xs text-[#d3e4fe]">
                    {isFr
                      ? "DBMastery Studio n'a aucun lien avec Microsoft Corporation. Microsoft, Azure, Azure SQL et Transact-SQL sont des marques déposées de Microsoft Corporation. Les références aux examens DP-900, DP-800 et DP-300 servent uniquement de référentiel d'apprentissage."
                      : 'DBMastery Studio has no affiliation with Microsoft Corporation. Microsoft, Azure, and Azure SQL are registered trademarks of Microsoft Corporation. Exam references DP-900/DP-800 serve only as syllabus guides.'}
                  </p>
                </div>

                {/* PostgreSQL */}
                <div className="p-4 rounded-xl bg-[#061322] border border-[#3b82f6]/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-[#60a5fa] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#60a5fa]"></span>
                      PostgreSQL & EnterpriseDB (EDB)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3b82f6]/20 text-[#bfdbfe]">
                      {isFr ? 'Indépendant' : 'Independent'}
                    </span>
                  </div>
                  <p className="text-xs text-[#d3e4fe]">
                    {isFr
                      ? "PostgreSQL est une marque déposée de la PostgreSQL Community Association of Canada. EnterpriseDB (EDB) est une marque d'EnterpriseDB Corporation. DBMastery Studio est développé indépendamment du PostgreSQL Global Development Group et d'EDB."
                      : 'PostgreSQL is a registered trademark of the PostgreSQL Community Association of Canada. EnterpriseDB (EDB) is a trademark of EnterpriseDB Corporation. DBMastery Studio is completely independent.'}
                  </p>
                </div>

                {/* MySQL */}
                <div className="p-4 rounded-xl bg-[#061322] border border-[#f59e0b]/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-[#fbbf24] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#fbbf24]"></span>
                      MySQL & 1Z0-908 DBA
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f59e0b]/20 text-[#fde047]">
                      {isFr ? 'Indépendant' : 'Independent'}
                    </span>
                  </div>
                  <p className="text-xs text-[#d3e4fe]">
                    {isFr
                      ? "MySQL est une marque déposée d'Oracle Corporation. DBMastery Studio n'est ni sponsorisé ni affilié à l'équipe officielle MySQL ou aux programmes de certification MySQL 8.0 Database Administrator."
                      : 'MySQL is a registered trademark of Oracle Corporation. DBMastery Studio is neither sponsored nor affiliated with the official MySQL product team or certification program.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] space-y-2">
                <h4 className="font-mono text-xs uppercase font-extrabold text-[#89ceff]">
                  {isFr ? 'Principes de la doctrine de l’usage loyal (Nominative Fair Use) :' : 'Nominative Fair Use doctrine principles:'}
                </h4>
                <ul className="text-xs space-y-1.5 list-disc pl-4 text-[#bfc7d2]">
                  <li>
                    {isFr
                      ? 'L’utilisation des noms de SGBD et des intitulés d’examens est rigoureusement limitée à ce qui est nécessaire pour identifier les objectifs d’apprentissage.'
                      : 'The use of DBMS and exam names is strictly necessary to identify learning objectives.'}
                  </li>
                  <li>
                    {isFr
                      ? 'Aucune confusion commerciale n’est induite : DBMastery Studio ne vend ni ne commercialise de vouchers d’examen officiels.'
                      : 'No commercial confusion is induced: DBMastery Studio does not resell official exam vouchers.'}
                  </li>
                  <li>
                    {isFr
                      ? 'Aucun contenu confidentiel sous accord de non-divulgation (NDA) officiel n’est hébergé ; les questions sont des créations didactiques originales basées sur les spécifications SQL ANSI et la documentation publique.'
                      : 'No confidential NDA-protected official exam material is hosted; all questions are original educational creations based on SQL ANSI standards and public docs.'}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: ÉDITEUR & OBJET */}
          {activeTab === 'editeur' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 text-[#38bdf8] font-bold text-base">
                <Building2 className="w-5 h-5 text-[#38bdf8]" />
                <h3>{isFr ? 'Présentation du service et éditeur' : 'Service overview & Publisher'}</h3>
              </div>

              <div className="space-y-3">
                <p>
                  <strong>DBMastery Studio</strong> {isFr 
                    ? "est une application web interactive d'auto-évaluation et d'entraînement conçue pour les développeurs, administrateurs de bases de données (DBA), ingénieurs data et étudiants préparant des concours ou entretiens techniques."
                    : 'is an interactive self-assessment and training web application designed for developers, DBAs, data engineers, and students preparing for technical certifications and interviews.'}
                </p>
                <p>
                  {isFr
                    ? "L'objectif exclusif du service est d'apporter un soutien pédagogique moderne : moteur de simulation SQL in-memory, explication progressive des erreurs, diagnostic de niveau initial et répétition espacée (flashcards)."
                    : 'The exclusive purpose of the service is modern pedagogical support: in-memory SQL execution sandbox, progressive error explanations, initial diagnostic benchmarks, and spaced repetition flashcards.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f] space-y-2">
                <div className="font-mono text-xs font-bold text-[#4edea3]">
                  {isFr ? 'Absence de valeur de certification officielle :' : 'Non-certifying status:'}
                </div>
                <p className="text-xs">
                  {isFr
                    ? "Les diplômes, notes, taux de réussite ou badges générés au sein de DBMastery Studio sont des indicateurs d'entraînement purement internes. Ils ne remplacent en aucun cas un diplôme ou certificat officiel délivré par Pearson VUE, Certiport, Oracle University, Microsoft Learn ou EnterpriseDB."
                    : 'Scores, pass rates, or badges generated in DBMastery Studio are purely internal training metrics. They do not replace official credentials issued by Pearson VUE, Certiport, Oracle University, Microsoft Learn, or EnterpriseDB.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PROPRIÉTÉ INTELLECTUELLE */}
          {activeTab === 'ip' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 text-[#89ceff] font-bold text-base">
                <Scale className="w-5 h-5 text-[#89ceff]" />
                <h3>{isFr ? 'Propriété intellectuelle et droits d’auteur' : 'Intellectual Property and Copyright'}</h3>
              </div>

              <p>
                {isFr
                  ? "L'ensemble des éléments constituant l'application DBMastery Studio (architecture logicielle, moteur de test SQL in-memory, interface graphique, charte visuelle, algorithme de diagnostic adaptatif et synthèses de cours) sont protégés au titre du droit d'auteur."
                  : 'All elements comprising DBMastery Studio (software architecture, in-memory SQL execution engine, user interface, diagnostic algorithms, and study summaries) are protected by copyright.'}
              </p>

              <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f] space-y-2">
                <span className="font-mono text-xs font-bold text-[#fbbf24]">
                  {isFr ? 'Marques citées à titre indicatif :' : 'Trademarks cited for reference only:'}
                </span>
                <p className="text-xs">
                  {isFr
                    ? "Oracle, Oracle SQL, PL/SQL, MySQL, Microsoft, Microsoft Azure, Azure SQL, Transact-SQL, PostgreSQL et EnterpriseDB sont des marques ou marques déposées de leurs sociétés respectives dans le monde entier. Leur citation sur cette plateforme n'implique aucune approbation ni lien juridique quelconque de leur part."
                    : 'Oracle, Oracle SQL, PL/SQL, MySQL, Microsoft, Microsoft Azure, Azure SQL, Transact-SQL, PostgreSQL, and EnterpriseDB are trademarks or registered trademarks of their respective companies worldwide. Their mention implies no endorsement or legal association.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: RGPD & DONNÉES */}
          {activeTab === 'rgpd' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 text-[#4edea3] font-bold text-base">
                <Lock className="w-5 h-5 text-[#4edea3]" />
                <h3>{isFr ? 'Protection des Données Personnelles (RGPD / GDPR)' : 'Personal Data Protection (GDPR)'}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-2">
                  <span className="font-mono text-xs font-bold text-[#38bdf8]">
                    {isFr ? '1. Stockage Local (Par défaut)' : '1. Local Storage (Default)'}
                  </span>
                  <p className="text-xs">
                    {isFr
                      ? "Par défaut, toutes vos réponses, vos scores, votre arbre de maîtrise et vos préférences sont stockés uniquement sur votre équipement (localStorage de votre navigateur). Aucune donnée n'est transmise sans votre consentement."
                      : 'By default, your answers, scores, mastery tree, and settings are stored locally on your device (browser localStorage). No data is transmitted without consent.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-2">
                  <span className="font-mono text-xs font-bold text-[#4edea3]">
                    {isFr ? '2. Synchronisation Cloud Firebase' : '2. Firebase Cloud Sync'}
                  </span>
                  <p className="text-xs">
                    {isFr
                      ? "En cas de connexion volontaire via Google Sign-In, vos données de progression sont sécurisées sur Google Cloud Firestore. Seules les informations nécessaires à votre session (nom, e-mail, identifiant Google) sont collectées."
                      : 'Upon voluntary Google Sign-In, your learning metrics are secured via Google Cloud Firestore. Only necessary session info (name, email, Google user ID) is kept.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] space-y-2">
                <span className="font-mono text-xs font-bold text-[#89ceff]">
                  {isFr ? 'Vos droits (Accès, Rectification, Suppression totale) :' : 'Your Rights (Access, Rectification, Full Reset):'}
                </span>
                <p className="text-xs">
                  {isFr
                    ? "Conformément à la réglementation européenne RGPD, vous disposez à tout moment du droit de réinitialiser ou purger l'intégralité de vos statistiques et données enregistrées, accessible directement depuis le menu « Paramètres Système » de l'application."
                    : 'In compliance with European GDPR, you have the right to erase, export, or reset all your metrics at any moment directly via the "System Settings" dialog.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: RESPONSABILITÉ */}
          {activeTab === 'responsibility' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-2 text-[#fbbf24] font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-[#fbbf24]" />
                <h3>{isFr ? 'Limitation de responsabilité & Conseils de révision' : 'Limitation of Liability & Preparation Advice'}</h3>
              </div>

              <p>
                {isFr
                  ? "DBMastery Studio met tout en œuvre pour fournir des explications rigoureuses, conformes aux standards SQL ANSI et aux comportements réels des moteurs (Oracle 19c/21c, PostgreSQL 15/16, MySQL 8.0, Azure SQL). Cependant, l'application est fournie « en l'état » sans garantie expresse ou implicite."
                  : 'DBMastery Studio strives to provide high quality explanations adhering to ANSI SQL and engine behaviors. However, the software is provided "as is" without warranty.'}
              </p>

              <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f] space-y-2">
                <span className="font-mono text-xs font-bold text-[#d3e4fe]">
                  {isFr ? 'Recommandations pour les candidats aux examens :' : 'Advice for certification candidates:'}
                </span>
                <ul className="text-xs space-y-1 list-disc pl-4 text-[#bfc7d2]">
                  <li>
                    {isFr
                      ? 'Consultez systématiquement les programmes officiels publiés sur les portails Oracle University, Microsoft Learn ou EnterpriseDB avant de passer votre examen.'
                      : 'Always check official syllabi on Oracle University, Microsoft Learn, or EnterpriseDB before taking exams.'}
                  </li>
                  <li>
                    {isFr
                      ? 'Complétez votre entraînement par des travaux pratiques dans des environnements SGBD réels dédiés.'
                      : 'Complement training with real database instances in your local labs.'}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#031120] border-t border-[#1b2b3f] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#89929b]">
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
            <span>{isFr ? 'Conformité légale & transparence' : 'Legal compliance & transparency'}</span>
            <span>•</span>
            <span className="text-[#38bdf8]">DBMastery Studio v1.2</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopy}
              className="sm:hidden px-3 py-2 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] text-xs font-mono text-[#89ceff]"
            >
              {hasCopied ? (isFr ? 'Copié !' : 'Copied!') : (isFr ? 'Copier' : 'Copy')}
            </button>
            <button
              id="legal-mentions-close-btn"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {isFr ? 'J’ai compris & Fermer' : 'Got it & Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
