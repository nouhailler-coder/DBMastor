import { FlashcardItem } from '../types';
import { oracleDom05Part1Flashcards } from './flashcardsOracleDom05_part1';
import { oracleDom05Part2Flashcards } from './flashcardsOracleDom05_part2';

export const oracleDom05Flashcards: FlashcardItem[] = [
  ...oracleDom05Part1Flashcards,
  ...oracleDom05Part2Flashcards,
];
