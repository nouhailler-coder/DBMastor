import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Table as TableIcon, 
  ArrowRight, 
  RefreshCw,
  FileCode,
  Rows,
  Layers
} from 'lucide-react';
import { getTableData } from '../services/sqlEngineService';

interface SqlDataBrowserProps {
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
  onLoadQueryIntoEditor: (sql: string) => void;
}

export const SqlDataBrowser: React.FC<SqlDataBrowserProps> = ({
  lang,
  theme = 'light',
  onLoadQueryIntoEditor
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';
  const [selectedTable, setSelectedTable] = useState<'employees' | 'departments'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);

  const tableData = getTableData(selectedTable);

  const filteredRows = tableData.rows.filter((row) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some((val) => 
      String(val ?? '').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const handleSelectTable = (table: 'employees' | 'departments') => {
    setSelectedTable(table);
    setPage(1);
    setSearchTerm('');
  };

  return (
    <div 
      id="sql-data-browser" 
      className={`rounded-xl border shadow-md flex flex-col overflow-hidden animate-fadeIn ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#102034] border-[#1b2b3f]'
      }`}
    >
      {/* Top Bar */}
      <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b1c30] border-[#1b2b3f]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${
            isLight ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-[#002c47] text-[#89ceff] border-[#3198dc]/30'
          }`}>
            <Database className={`w-5 h-5 ${isLight ? 'text-sky-600' : 'text-[#4edea3]'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isFr ? 'Navigateur de Données Relationnelles' : 'Relational Data Browser'}
              </h2>
              <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-[#003824] text-[#4edea3] border-[#4edea3]/40'
              }`}>
                {isFr ? 'Base de données Active' : 'Live In-Memory DB'}
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {isFr 
                ? 'Consultez et inspectez directement les lignes stockées en mémoire dans le moteur SQL.' 
                : 'Inspect and search live relational rows stored inside the in-browser SQL engine.'}
            </p>
          </div>
        </div>

        {/* Table Selector Tabs */}
        <div className={`flex items-center gap-1.5 p-1 rounded-lg border ${
          isLight ? 'bg-slate-200/70 border-slate-300' : 'bg-[#000f21] border-[#1b2b3f]'
        }`}>
          <button
            onClick={() => handleSelectTable('employees')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
              selectedTable === 'employees'
                ? (isLight ? 'bg-sky-600 text-white shadow-xs' : 'bg-[#3198dc] text-[#002c47] shadow-sm')
                : (isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-white' : 'text-slate-300 hover:text-white hover:bg-[#1b2b3f]')
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>employees</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
              isLight ? 'bg-black/10' : 'bg-black/20'
            }`}>44</span>
          </button>

          <button
            onClick={() => handleSelectTable('departments')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
              selectedTable === 'departments'
                ? (isLight ? 'bg-sky-600 text-white shadow-xs' : 'bg-[#3198dc] text-[#002c47] shadow-sm')
                : (isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-white' : 'text-slate-300 hover:text-white hover:bg-[#1b2b3f]')
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>departments</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
              isLight ? 'bg-black/10' : 'bg-black/20'
            }`}>4</span>
          </button>
        </div>
      </div>

      {/* Filter and Quick Query Action Bar */}
      <div className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-[#0e1e33] border-[#1b2b3f]'
      }`}>
        {/* Search input */}
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
            isLight ? 'text-slate-400' : 'text-slate-400'
          }`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder={isFr ? `Filtrer dans ${selectedTable}...` : `Search in ${selectedTable}...`}
            className={`w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs font-mono focus:outline-none ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500'
                : 'bg-[#000f21] border-[#1b2b3f] text-white placeholder:text-slate-400 focus:border-[#3198dc]'
            }`}
          />
        </div>

        {/* Quick query shortcut */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onLoadQueryIntoEditor(`SELECT * FROM ${selectedTable};`);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all ${
              isLight
                ? 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
                : 'bg-[#1b2b3f] hover:bg-[#26364a] text-[#89ceff] border-[#26364a]'
            }`}
          >
            <FileCode className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-[#4edea3]'}`} />
            <span>{isFr ? `Charger SELECT * FROM ${selectedTable}` : `Load SELECT * FROM ${selectedTable}`}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Table Data View */}
      <div className={`overflow-x-auto min-h-[340px] ${
        isLight ? 'bg-white' : 'bg-[#000f21]'
      }`}>
        {paginatedRows.length === 0 ? (
          <div className={`p-8 text-center text-xs font-mono ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {isFr ? 'Aucune ligne ne correspond aux critères de recherche.' : 'No rows match your search criteria.'}
          </div>
        ) : (
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className={`border-b ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0b1c30] border-[#1b2b3f] text-slate-200'
              }`}>
                {tableData.columns.map((col) => (
                  <th key={col} className={`px-4 py-2.5 text-[11px] font-bold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span>{col}</span>
                      {col.includes('_id') && (
                        <span className={`text-[9px] px-1 rounded font-normal ${
                          isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-[#003824] text-[#4edea3]'
                        }`}>
                          {col === 'department_id' && selectedTable === 'employees' ? 'FK' : 'PK'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#102034]'}`}>
              {paginatedRows.map((row, idx) => (
                <tr key={idx} className={`transition-colors ${
                  isLight 
                    ? 'hover:bg-slate-50 text-slate-800' 
                    : 'hover:bg-[#102034]/70 text-slate-200'
                }`}>
                  {tableData.columns.map((col) => {
                    const val = row[col];
                    const isDeptCol = col === 'department' || col === 'department_name';
                    const isSalaryCol = col === 'salary';
                    return (
                      <td key={col} className="px-4 py-2 text-xs whitespace-nowrap">
                        {isDeptCol ? (
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            isLight
                              ? 'bg-sky-100 text-sky-900 border-sky-300'
                              : 'bg-[#002c47] text-sky-100 border-[#3198dc]/40'
                          }`}>
                            {String(val)}
                          </span>
                        ) : isSalaryCol ? (
                          <span className={`font-semibold ${isLight ? 'text-emerald-700' : 'text-[#4edea3]'}`}>
                            {Number(val).toLocaleString()} €
                          </span>
                        ) : (
                          <span className={isLight ? 'text-slate-900' : 'text-white'}>{String(val ?? 'NULL')}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className={`p-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0b1c30] border-[#1b2b3f] text-slate-300'
      }`}>
        <div className="flex items-center gap-2">
          <span>
            {isFr 
              ? `Affichage de ${filteredRows.length > 0 ? (page - 1) * pageSize + 1 : 0} à ${Math.min(page * pageSize, filteredRows.length)} sur ${filteredRows.length} lignes` 
              : `Showing ${filteredRows.length > 0 ? (page - 1) * pageSize + 1 : 0} to ${Math.min(page * pageSize, filteredRows.length)} of ${filteredRows.length} rows`}
          </span>
          {selectedTable === 'employees' && (
            <span className={`hidden sm:inline-block px-2 py-0.5 rounded border text-[10px] font-semibold ${
              isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-[#003824]/40 text-[#4edea3] border-[#4edea3]/40'
            }`}>
              {isFr ? 'Effectifs réels : IT=12 • HR=8 • Sales=24' : 'Real dataset: IT=12 • HR=8 • Sales=24'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`px-2.5 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed border ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                : 'bg-[#102034] text-white border-[#1b2b3f] hover:bg-[#1b2b3f]'
            }`}
          >
            {isFr ? 'Précédent' : 'Previous'}
          </button>
          <span className={`px-2 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`px-2.5 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed border ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                : 'bg-[#102034] text-white border-[#1b2b3f] hover:bg-[#1b2b3f]'
            }`}
          >
            {isFr ? 'Suivant' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
