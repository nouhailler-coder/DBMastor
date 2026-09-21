import { GlossaryTerm, GlossaryCategoryMeta } from '../../types';
import { GLOSSARY_CATEGORIES } from './categories';
import { CAT1_CONCEPTS_TERMS } from './cat1_concepts';
import { CAT2_KEYS_CONSTRAINTS_TERMS } from './cat2_keys_constraints';
import { CAT3_DATA_TYPES_TERMS } from './cat3_data_types';
import { CAT4_SQL_COMMANDS_TERMS } from './cat4_sql_commands';
import { CAT5_CLAUSES_OPERATORS_TERMS } from './cat5_clauses_operators';
import { CAT6_JOINS_COMBINATIONS_TERMS } from './cat6_joins_combinations';
import { CAT7_ADVANCED_OPTIMIZATION_TERMS } from './cat7_advanced_optimization';
import { CAT8_THEORY_ARCHITECTURE_TERMS } from './cat8_theory_architecture';

export { GLOSSARY_CATEGORIES };

export const ALL_GLOSSARY_TERMS: GlossaryTerm[] = [
  ...CAT1_CONCEPTS_TERMS,
  ...CAT2_KEYS_CONSTRAINTS_TERMS,
  ...CAT3_DATA_TYPES_TERMS,
  ...CAT4_SQL_COMMANDS_TERMS,
  ...CAT5_CLAUSES_OPERATORS_TERMS,
  ...CAT6_JOINS_COMBINATIONS_TERMS,
  ...CAT7_ADVANCED_OPTIMIZATION_TERMS,
  ...CAT8_THEORY_ARCHITECTURE_TERMS,
];

export function getGlossaryTermById(id: string): GlossaryTerm | undefined {
  return ALL_GLOSSARY_TERMS.find((term) => term.id === id);
}

export function getGlossaryTermsByCategory(categoryId: number): GlossaryTerm[] {
  return ALL_GLOSSARY_TERMS.filter((term) => term.category === categoryId);
}

export function getCategoryMeta(categoryId: number): GlossaryCategoryMeta | undefined {
  return GLOSSARY_CATEGORIES.find((cat) => cat.id === categoryId);
}

export const GLOSSARY_STATS = {
  totalTerms: ALL_GLOSSARY_TERMS.length,
  totalCategories: GLOSSARY_CATEGORIES.length,
  beginnerTermsCount: ALL_GLOSSARY_TERMS.filter(t => t.difficulty === 'beginner').length,
  intermediateTermsCount: ALL_GLOSSARY_TERMS.filter(t => t.difficulty === 'intermediate').length,
  advancedTermsCount: ALL_GLOSSARY_TERMS.filter(t => t.difficulty === 'advanced').length,
};
