import { FlashcardItem } from '../types';
import { mysql908Dom04Part1Flashcards } from './flashcardsMysql908Dom04_part1';
import { mysql908Dom04Part2Flashcards } from './flashcardsMysql908Dom04_part2';

export const mysql908Dom04Flashcards: FlashcardItem[] = [
  ...mysql908Dom04Part1Flashcards,
  ...mysql908Dom04Part2Flashcards,
];
