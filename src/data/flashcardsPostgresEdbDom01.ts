import { FlashcardItem } from '../types';
import { postgresEdbDom01Part1Flashcards } from './flashcardsPostgresEdbDom01_part1';
import { postgresEdbDom01Part2Flashcards } from './flashcardsPostgresEdbDom01_part2';

export const postgresEdbDom01Flashcards: FlashcardItem[] = [
  ...postgresEdbDom01Part1Flashcards,
  ...postgresEdbDom01Part2Flashcards,
];
