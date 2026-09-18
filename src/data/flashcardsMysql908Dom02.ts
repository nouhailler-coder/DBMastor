import { FlashcardItem } from '../types';
import { mysql908Dom02Part1Flashcards } from './flashcardsMysql908Dom02_part1';
import { mysql908Dom02Part2Flashcards } from './flashcardsMysql908Dom02_part2';

export const mysql908Dom02Flashcards: FlashcardItem[] = [
  ...mysql908Dom02Part1Flashcards,
  ...mysql908Dom02Part2Flashcards,
];
