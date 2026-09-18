import { FlashcardItem } from '../types';
import { postgresEdbDom05Part1Flashcards } from './flashcardsPostgresEdbDom05_part1';
import { postgresEdbDom05Part2Flashcards } from './flashcardsPostgresEdbDom05_part2';

export const postgresEdbDom05Flashcards: FlashcardItem[] = [
  ...postgresEdbDom05Part1Flashcards,
  ...postgresEdbDom05Part2Flashcards,
];
