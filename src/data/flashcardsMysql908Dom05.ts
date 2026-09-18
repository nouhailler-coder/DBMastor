import { FlashcardItem } from '../types';
import { mysql908Dom05Part1Flashcards } from './flashcardsMysql908Dom05_part1';
import { mysql908Dom05Part2Flashcards } from './flashcardsMysql908Dom05_part2';

export const mysql908Dom05Flashcards: FlashcardItem[] = [
  ...mysql908Dom05Part1Flashcards,
  ...mysql908Dom05Part2Flashcards,
];
