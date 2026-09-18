import { FlashcardItem } from '../types';
import { mysql908Dom03Part1Flashcards } from './flashcardsMysql908Dom03_part1';
import { mysql908Dom03Part2Flashcards } from './flashcardsMysql908Dom03_part2';

export const mysql908Dom03Flashcards: FlashcardItem[] = [
  ...mysql908Dom03Part1Flashcards,
  ...mysql908Dom03Part2Flashcards,
];
