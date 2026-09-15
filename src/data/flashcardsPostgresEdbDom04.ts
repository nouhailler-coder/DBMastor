import { FlashcardItem } from '../types';
import { postgresEdbDom04Part1Flashcards } from './flashcardsPostgresEdbDom04_part1';
import { postgresEdbDom04Part2Flashcards } from './flashcardsPostgresEdbDom04_part2';

export const postgresEdbDom04Flashcards: FlashcardItem[] = [
  ...postgresEdbDom04Part1Flashcards,
  ...postgresEdbDom04Part2Flashcards,
];
