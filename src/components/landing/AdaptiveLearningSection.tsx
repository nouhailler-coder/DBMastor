import React, { useState } from 'react';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { Brain, Zap, Target, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface AdaptiveLearningSectionProps {
  t: LandingTranslations['adaptive'];
  onOpenApp: (tab?: string) => void;
}

export const AdaptiveLearningSection: React.FC<AdaptiveLearningSectionProps> = ({ t, onOpenApp }) => {
  const [activeProfileTab, setActiveProfileTab] = useState<'reflex' | 'hesitant'>('reflex');

  const pillarsList = [
    { key: 'syntax', ...t.pillars.syntax },
    { key: 'modeling', ...t.pillars.modeling },
    { key: 'architecture', ...t.pillars.architecture },
    { key: 'optimization', ...t.pillars.optimization },
  ];

  return (
    <section id="adaptive" className="py-24 bg-[#030a14] border-t border-[#1b2b3f] relative">
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

        {/* 4 Pillars Grid */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#38bdf8]" />
              <span>{t.fourPillarsTitle}</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Évaluation multidimensionnelle en temps réel
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillarsList.map((pillar, idx) => (
              <div
                key={pillar.key}
                className="bg-[#0b1728]/80 border border-[#1b2b3f] rounded-2xl p-6 backdrop-blur-sm hover:border-[#38bdf8]/50 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-[#4edea3] font-bold">PILIER 0{idx + 1}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#102034] text-[#38bdf8] border border-[#1b2b3f] font-bold">
                    {pillar.score}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-2 group-hover:text-[#38bdf8] transition-colors">
                  {pillar.name}
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cognitive Reflex Comparison Box */}
        <div className="bg-[#071322] border border-[#1b2b3f] rounded-3xl p-6 sm:p-10 mb-16 shadow-2xl">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#4edea3] mb-2">
              <Zap className="w-4 h-4" />
              <span>Modèle Cognitif Quadridimensionnel</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              « 8/10 en 4 minutes n'est pas le même niveau que 9/10 en 20 secondes. »
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              La plupart des plateformes se limitent à un pourcentage binaire. DBMastery Studio évalue 4 dimensions pour chaque compétence : Connaissances, Précision, Vélocité et Régularité.
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setActiveProfileTab('reflex')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeProfileTab === 'reflex'
                  ? 'bg-[#0284c7] text-white shadow-lg'
                  : 'bg-[#102034] text-slate-400 hover:text-slate-200'
              }`}
            >
              Profil A : Architecte Réflexe (20s)
            </button>
            <button
              type="button"
              onClick={() => setActiveProfileTab('hesitant')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeProfileTab === 'hesitant'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-[#102034] text-slate-400 hover:text-slate-200'
              }`}
            >
              Profil B : Analyste Hésitant (4 min)
            </button>
          </div>

          {activeProfileTab === 'reflex' ? (
            <div className="bg-[#030a14] border border-[#38bdf8]/40 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="text-base font-bold text-white">Profil A : Maîtrise Instinctive & Réflexe</h5>
                  <p className="text-xs font-mono text-[#4edea3]">Score Composite : 94 / 100 • Vélocité : 20s / question</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  Prêt pour l'examen
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                La syntaxe est un réflexe immédiat. Les pièges classiques (logique ternaire avec NULL, WHERE sur jointure externe) sont identifiés en un coup d'œil. Zéro sur-délibération en conditions d'examen minuté.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#0b1728] border border-[#1b2b3f]"><span className="text-slate-400 block">Connaissances</span><span className="text-white font-bold text-sm">95%</span></div>
                <div className="p-2.5 rounded-lg bg-[#0b1728] border border-[#1b2b3f]"><span className="text-slate-400 block">Précision</span><span className="text-white font-bold text-sm">90%</span></div>
                <div className="p-2.5 rounded-lg bg-[#0b1728] border border-[#1b2b3f]"><span className="text-slate-400 block">Vitesse</span><span className="text-[#4edea3] font-bold text-sm">98%</span></div>
                <div className="p-2.5 rounded-lg bg-[#0b1728] border border-[#1b2b3f]"><span className="text-slate-400 block">Régularité</span><span className="text-white font-bold text-sm">94%</span></div>
              </div>
            </div>
          ) : (
            <div className="bg-[#030a14] border border-amber-500/40 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="text-base font-bold text-white">Profil B : Sur-Délibération & Hésitation</h5>
                  <p className="text-xs font-mono text-amber-400">Score Composite : 54 / 100 • Vélocité : 4m / question</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  Fragilité temporelle
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Bonne base théorique mais manque d'automatismes. En production sous incident ou en examen certifié (ex: Oracle 1Z0-071), le temps manquera sur les requêtes complexes.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#0b1728] border border-[#1b2b3f]"><span className="text-slate-400 block">Connaissances</span><span className="text-white font-bold text-sm">85%</span></div>
                <div className="p-2.5 rounded-lg bg-[#0b1728] border border-[#1b2b3f]"><span className="text-slate-400 block">Précision</span><span className="text-white font-bold text-sm">80%</span></div>
                <div className="p-2.5 rounded-lg bg-[#0b1728] border border-[#1b2b3f]"><span className="text-slate-400 block">Vitesse</span><span className="text-red-400 font-bold text-sm">20%</span></div>
                <div className="p-2.5 rounded-lg bg-[#0b1728] border border-[#1b2b3f]"><span className="text-slate-400 block">Régularité</span><span className="text-amber-400 font-bold text-sm">50%</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Spaced Repetition (SM-2 / FSRS) Block */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0284c7]/10 via-[#071322] to-[#4edea3]/10 border border-[#1b2b3f] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#38bdf8] font-bold uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4 text-[#4edea3]" />
              <span>Algorithme de Répétition Espacée SM-2 / FSRS</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
              Une question mal maîtrisée revient au moment optimal.
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              Erreur → Révision dans 1 jour → Bonne réponse → Révision dans 3 jours → Bonne réponse → Révision dans 7 jours → Notions ancrées en mémoire à long terme.
            </p>
            <div className="text-xs font-mono text-slate-400">
              {t.diagnosticNotice}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenApp('skills')}
            className="px-6 py-3.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm shadow-xl shadow-[#0284c7]/30 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>Explorer la Skill Map 4D</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
