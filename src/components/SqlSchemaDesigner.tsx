import React from 'react';
import { 
  Layers, 
  Key, 
  Link2, 
  Database, 
  Code2, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface SqlSchemaDesignerProps {
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
  onLoadQueryIntoEditor: (sql: string) => void;
}

export const SqlSchemaDesigner: React.FC<SqlSchemaDesignerProps> = ({
  lang,
  theme = 'light',
  onLoadQueryIntoEditor
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';

  return (
    <div 
      id="sql-schema-designer" 
      className={`rounded-xl border shadow-md flex flex-col overflow-hidden animate-fadeIn ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#102034] border-[#1b2b3f]'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b1c30] border-[#1b2b3f]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${
            isLight ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-[#002c47] text-[#89ceff] border-[#3198dc]/30'
          }`}>
            <Layers className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isFr ? 'Concepteur & Diagramme Relationnel' : 'Schema Designer & Relational ERD'}
              </h2>
              <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                isLight ? 'bg-sky-100 text-sky-900 border-sky-300' : 'bg-[#002c47] text-[#89ceff] border-[#3198dc]/30'
              }`}>
                Schema: HR_CORP
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {isFr 
                ? 'Architecture des entités, clés primaires (PK), clés étrangères (FK) et contraintes d\'intégrité.' 
                : 'Entity architecture, primary keys (PK), foreign keys (FK) and integrity constraints.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            onLoadQueryIntoEditor(`SELECT e.employee_id, e.last_name, e.department, d.location, e.salary
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id;`);
          }}
          className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto border ${
            isLight
              ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
              : 'bg-[#1b2b3f] hover:bg-[#26364a] text-white border-[#26364a]'
          }`}
        >
          <Code2 className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-[#4edea3]'}`} />
          <span>{isFr ? 'Générer requête multi-tables' : 'Generate Multi-Table Join'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Diagram Canvas */}
      <div className={`p-6 flex flex-col gap-6 ${
        isLight ? 'bg-slate-50/60' : 'bg-[#000f21]'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Table Card 1: employees */}
          <div className={`rounded-xl border-2 shadow-lg overflow-hidden flex flex-col ${
            isLight
              ? 'bg-white border-sky-300'
              : 'bg-[#0b1c30] border-[#3198dc]/50'
          }`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between ${
              isLight ? 'bg-sky-50 border-sky-200' : 'bg-[#102034] border-[#1b2b3f]'
            }`}>
              <div className="flex items-center gap-2">
                <Database className={`w-4 h-4 ${isLight ? 'text-sky-600' : 'text-[#4edea3]'}`} />
                <span className={`font-mono text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>public.employees</span>
              </div>
              <span className={`font-mono text-[10px] px-2 py-0.5 rounded border font-semibold ${
                isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-[#003824] text-[#4edea3] border-[#4edea3]/40'
              }`}>
                44 {isFr ? 'enregistrements' : 'records'}
              </span>
            </div>

            <div className={`p-3 flex flex-col divide-y font-mono text-xs ${
              isLight ? 'divide-slate-200' : 'divide-[#1b2b3f]/70'
            }`}>
              <div className="py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span className={`font-bold ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>employee_id</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>INT</span>
                  <span className="text-[10px] bg-amber-500/15 text-amber-500 font-bold px-1.5 py-0.2 rounded border border-amber-500/30">PK</span>
                </div>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>first_name</span>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>STRING</span>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>last_name</span>
                <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>STRING NOT NULL</span>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${isLight ? 'text-sky-800' : 'text-[#89ceff]'}`}>department</span>
                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>(IT, HR, Sales)</span>
                </div>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>STRING</span>
              </div>

              <div className={`py-1.5 flex items-center justify-between px-2 rounded -mx-1 border ${
                isLight 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                  : 'bg-[#003824]/30 text-[#4edea3] border-[#4edea3]/30'
              }`}>
                <div className="flex items-center gap-2">
                  <Link2 className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-700' : 'text-[#4edea3]'}`} />
                  <span className={`font-bold ${isLight ? 'text-emerald-900' : 'text-[#4edea3]'}`}>department_id</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] ${isLight ? 'text-emerald-700' : 'text-slate-400'}`}>INT</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${
                    isLight 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                      : 'bg-[#4edea3]/20 text-[#4edea3] border-[#4edea3]/40'
                  }`}>FK</span>
                </div>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>salary</span>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>INT (CHECK &gt; 0)</span>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>hire_date</span>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>STRING (ISO-8601)</span>
              </div>
            </div>
          </div>

          {/* Table Card 2: departments */}
          <div className={`rounded-xl border-2 shadow-lg overflow-hidden flex flex-col ${
            isLight
              ? 'bg-white border-emerald-300'
              : 'bg-[#0b1c30] border-[#4edea3]/40'
          }`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between ${
              isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-[#102034] border-[#1b2b3f]'
            }`}>
              <div className="flex items-center gap-2">
                <Database className={`w-4 h-4 ${isLight ? 'text-emerald-700' : 'text-[#89ceff]'}`} />
                <span className={`font-mono text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>public.departments</span>
              </div>
              <span className={`font-mono text-[10px] px-2 py-0.5 rounded border font-semibold ${
                isLight ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-[#002c47] text-[#89ceff] border-[#3198dc]/30'
              }`}>
                4 {isFr ? 'enregistrements' : 'records'}
              </span>
            </div>

            <div className={`p-3 flex flex-col divide-y font-mono text-xs ${
              isLight ? 'divide-slate-200' : 'divide-[#1b2b3f]/70'
            }`}>
              <div className={`py-1.5 flex items-center justify-between px-2 rounded -mx-1 border ${
                isLight 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                  : 'bg-[#003824]/30 text-[#4edea3] border-[#4edea3]/30'
              }`}>
                <div className="flex items-center gap-2">
                  <Key className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-700' : 'text-[#4edea3]'}`} />
                  <span className={`font-bold ${isLight ? 'text-emerald-900' : 'text-[#4edea3]'}`}>department_id</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] ${isLight ? 'text-emerald-700' : 'text-slate-400'}`}>INT</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${
                    isLight 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                      : 'bg-[#4edea3]/20 text-[#4edea3] border-[#4edea3]/40'
                  }`}>PK</span>
                </div>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>department_name</span>
                <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>STRING NOT NULL</span>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>manager_id</span>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>INT</span>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>location</span>
                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>STRING (City)</span>
              </div>
            </div>

            {/* Department Summary in DB */}
            <div className={`mt-auto p-3 border-t text-[11px] font-mono space-y-1 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#102034]/60 border-[#1b2b3f] text-slate-300'
            }`}>
              <div className="flex justify-between">
                <span>10: HR (Paris)</span>
                <span className={`font-semibold ${isLight ? 'text-emerald-700' : 'text-[#4edea3]'}`}>8 emp.</span>
              </div>
              <div className="flex justify-between">
                <span>60: IT (Lyon)</span>
                <span className={`font-semibold ${isLight ? 'text-emerald-700' : 'text-[#4edea3]'}`}>12 emp.</span>
              </div>
              <div className="flex justify-between">
                <span>80: Sales (Marseille)</span>
                <span className={`font-semibold ${isLight ? 'text-emerald-700' : 'text-[#4edea3]'}`}>24 emp.</span>
              </div>
              <div className="flex justify-between">
                <span>90: Executive (Paris)</span>
                <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>0 emp.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Relational Link Visualizer */}
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0b1c30] border-[#1b2b3f]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${
              isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#003824] text-[#4edea3] border-[#4edea3]/30'
            }`}>
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <span className={`font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isFr ? 'Contrainte Référentielle 1:N' : '1:N Referential Integrity Constraint'}
              </span>
              <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                employees.department_id ➜ departments.department_id
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg border font-semibold ${
            isLight 
              ? 'bg-sky-50 text-sky-800 border-sky-200' 
              : 'text-[#89ceff] bg-[#002c47] border-[#3198dc]/30'
          }`}>
            <ShieldCheck className={`w-4 h-4 ${isLight ? 'text-sky-600' : 'text-[#4edea3]'}`} />
            <span>{isFr ? 'Jointures optimisées par Hash / Merge Join' : 'Optimized for Hash / Merge Join'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
