import React from 'react';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { ShieldCheck, Cloud, Database, Lock, CheckCircle2 } from 'lucide-react';

interface SecuritySectionProps {
  t: LandingTranslations['security'];
  onOpenApp: (tab?: string) => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ t, onOpenApp }) => {
  const featuresList = [
    { key: 'auth', ...t.features.auth, icon: Lock, color: 'text-[#38bdf8]' },
    { key: 'firestore', ...t.features.firestore, icon: Cloud, color: 'text-[#4edea3]' },
    { key: 'clientEngine', ...t.features.clientEngine, icon: Database, color: 'text-amber-400' },
    { key: 'rbac', ...t.features.rbac, icon: ShieldCheck, color: 'text-emerald-400' },
  ];

  return (
    <section id="security" className="py-24 bg-[#050c18] border-t border-[#1b2b3f] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#38bdf8] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            {t.tag}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t.headline}
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 4 Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuresList.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.key}
                className="bg-[#0b1728]/80 border border-[#1b2b3f] rounded-2xl p-6 backdrop-blur-sm hover:border-[#4edea3]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#102034] border border-[#1b2b3f] flex items-center justify-center mb-4">
                    <Icon className={`w-5 h-5 ${feat.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Architecture Isolation Graphic & Clarification */}
        <div className="bg-[#071322] border border-[#1b2b3f] rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#1b2b3f]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#4edea3]" />
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                Modèle d'Isolation Zéro Risque
              </span>
            </div>
            <span className="text-xs font-mono text-[#4edea3] bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60 font-bold">
              Aucun mot de passe de base requis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6">
            <div className="p-4 rounded-xl bg-[#0b1728] border border-[#1b2b3f]">
              <div className="text-xs font-mono text-[#38bdf8] font-bold mb-1">NAVIGATEUR LOCAL</div>
              <div className="text-sm font-bold text-white">AlaSQL In-Memory</div>
              <div className="text-xs text-slate-400 mt-1">Requêtes exécutées dans la RAM du navigateur sans fuite réseau</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0b1728] border border-[#1b2b3f]">
              <div className="text-xs font-mono text-purple-400 font-bold mb-1">AUTHENTIFICATION</div>
              <div className="text-sm font-bold text-white">Google OAuth 2.0</div>
              <div className="text-xs text-slate-400 mt-1">Connexion sécurisée en 1 clic sans gestion de mot de passe</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0b1728] border border-[#1b2b3f]">
              <div className="text-xs font-mono text-[#4edea3] font-bold mb-1">CLOUD FIRESTORE</div>
              <div className="text-sm font-bold text-white">Règles RBAC Strictes</div>
              <div className="text-xs text-slate-400 mt-1">Isolation stricte par utilisateur (`users/{"{userId}"}`)</div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed text-center max-w-2xl mx-auto">
            Les exercices d'entraînement SQL utilisent exclusivement le moteur in-memory. Vous apprenez et manipulez des schémas réels sans aucun risque pour un environnement de production.
          </p>
        </div>
      </div>
    </section>
  );
};
