import React from 'react';
import { Word } from './types';

// A helper function to create a consistent icon component from an emoji
// FIX: Replaced JSX with React.createElement to fix parsing errors in a .ts file.
const iconWrapper = (emoji: string): React.FC<{ className?: string }> =>
  ({ className }) => React.createElement(
    'div',
    { className: `flex items-center justify-center ${className}` },
    React.createElement(
      'span',
      { className: "text-7xl", role: "img" },
      emoji
    )
  );

export const WORDS: Word[] = [
  {
    english: 'Hello',
    chinese: '你好',
    pinyin: 'nǐ hǎo',
    Icon: iconWrapper('🐼'),
  },
  {
    english: 'I am Lucia',
    chinese: '我是露西娅',
    pinyin: 'wǒ shì lù xī yà',
    Icon: iconWrapper('👧'),
  },
  {
    english: 'Please',
    chinese: '请',
    pinyin: 'qǐng',
    Icon: iconWrapper('🙏'),
  },
  {
    english: 'Thank you',
    chinese: '谢谢',
    pinyin: 'xiè xie',
    Icon: iconWrapper('🐶'),
  },
  {
    english: 'Sorry',
    chinese: '对不起',
    pinyin: 'duì bu qǐ',
    Icon: iconWrapper('😿'),
  },
  {
    english: 'Not good',
    chinese: '不好',
    pinyin: 'bù hǎo',
    Icon: iconWrapper('👎'),
  },
  {
    english: 'Very good',
    chinese: '很好',
    pinyin: 'hěn hǎo',
    Icon: iconWrapper('👍'),
  },
];
