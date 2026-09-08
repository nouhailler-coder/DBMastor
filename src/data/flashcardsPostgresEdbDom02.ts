import { FlashcardItem } from '../types';
import { postgresEdbDom02Part1Flashcards } from './flashcardsPostgresEdbDom02_part1';
import { postgresEdbDom02Part2Flashcards } from './flashcardsPostgresEdbDom02_part2';

export const postgresEdbDom02Flashcards: FlashcardItem[] = [
  ...postgresEdbDom02Part1Flashcards,
  ...postgresEdbDom02Part2Flashcards,
];
