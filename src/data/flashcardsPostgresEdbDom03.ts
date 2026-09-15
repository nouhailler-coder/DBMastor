import { FlashcardItem } from '../types';
import { postgresEdbDom03Part1Flashcards } from './flashcardsPostgresEdbDom03_part1';
import { postgresEdbDom03Part2Flashcards } from './flashcardsPostgresEdbDom03_part2';

export const postgresEdbDom03Flashcards: FlashcardItem[] = [
  ...postgresEdbDom03Part1Flashcards,
  ...postgresEdbDom03Part2Flashcards,
];
