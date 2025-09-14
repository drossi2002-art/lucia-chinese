import React from 'react';

export interface Word {
  english: string;
  chinese: string;
  pinyin: string;
  Icon: React.FC<{ className?: string }>;
}