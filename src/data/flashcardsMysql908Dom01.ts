import { FlashcardItem } from '../types';
import { mysql908Dom01Part1Flashcards } from './flashcardsMysql908Dom01_part1';
import { mysql908Dom01Part2Flashcards } from './flashcardsMysql908Dom01_part2';

export const mysql908Dom01Flashcards: FlashcardItem[] = [
  ...mysql908Dom01Part1Flashcards,
  ...mysql908Dom01Part2Flashcards,
];
