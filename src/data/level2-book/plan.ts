import type { L2IndexUnit, L2Module } from './types.ts'

/**
 * The book's index, all twenty units: A2 → B1, the grammar in the order of
 * the British Council / EAQUALS core inventory, each point placed in the
 * situation that needs it. Units are written module by module; the contents
 * page lists them all from the start.
 */

export const MODULES: L2Module[] = [
  { n: 1, titleEn: 'People and everyday life', titleAr: 'الناس والحياة اليومية' },
  { n: 2, titleEn: 'Experiences and stories', titleAr: 'التجارب والقصص' },
  { n: 3, titleEn: 'Plans and the future', titleAr: 'الخطط والمستقبل' },
  { n: 4, titleEn: 'Work, services and problems', titleAr: 'العمل والخدمات والمشاكل' },
  { n: 5, titleEn: 'Opinions and ideas', titleAr: 'الآراء والأفكار' },
]

export const INDEX: L2IndexUnit[] = [
  { n: 1, module: 1, titleEn: 'Meeting someone new', titleAr: 'التعرّف على شخص جديد', grammar: 'Present simple & continuous', writing: 'A message after meeting someone' },
  { n: 2, module: 1, titleEn: 'Then and now', titleAr: 'الماضي والحاضر', grammar: 'Past simple & used to', writing: 'My life then and now' },
  { n: 3, module: 1, titleEn: 'People around me', titleAr: 'الناس من حولي', grammar: 'Comparatives & superlatives', writing: 'Describing a person' },
  { n: 4, module: 1, titleEn: 'Home and neighbourhood', titleAr: 'البيت والحيّ', grammar: 'Quantifiers & there is / are', writing: 'Describing a place' },
  { n: 5, module: 2, titleEn: 'What happened?', titleAr: 'ماذا حدث؟', grammar: 'Past simple & past continuous', writing: 'A short story' },
  { n: 6, module: 2, titleEn: 'Have you ever…?', titleAr: 'هل سبق لك…؟', grammar: 'Present perfect (experience)', writing: 'An email about a trip' },
  { n: 7, module: 2, titleEn: 'Good news, bad news', titleAr: 'أخبار سارّة وأخرى سيئة', grammar: 'Present perfect: just, yet, for, since', writing: 'A message with news' },
  { n: 8, module: 2, titleEn: 'It had already left!', titleAr: 'كان قد غادر!', grammar: 'Past perfect', writing: 'An apology email' },
  { n: 9, module: 3, titleEn: 'Making plans', titleAr: 'وضع الخطط', grammar: 'Going to & present continuous (future)', writing: 'An invitation and a reply' },
  { n: 10, module: 3, titleEn: 'Promises and predictions', titleAr: 'الوعود والتوقعات', grammar: 'Will, might, may', writing: 'My goals for next year' },
  { n: 11, module: 3, titleEn: 'If it rains…', titleAr: 'إذا أمطرت…', grammar: 'Zero & first conditional', writing: 'An email with suggestions' },
  { n: 12, module: 3, titleEn: 'If I were you…', titleAr: 'لو كنت مكانك…', grammar: 'Second conditional', writing: 'An advice email' },
  { n: 13, module: 4, titleEn: 'Rules and advice', titleAr: 'القواعد والنصائح', grammar: 'Must, have to, should', writing: 'A notice of rules' },
  { n: 14, module: 4, titleEn: 'Could you tell me…?', titleAr: 'هل يمكنك أن تخبرني…؟', grammar: 'Polite requests & indirect questions', writing: 'A formal enquiry email' },
  { n: 15, module: 4, titleEn: 'Problems and complaints', titleAr: 'المشاكل والشكاوى', grammar: 'The passive', writing: 'A complaint email' },
  { n: 16, module: 4, titleEn: 'The job interview', titleAr: 'مقابلة العمل', grammar: 'Gerunds & infinitives', writing: 'A job application email' },
  { n: 17, module: 5, titleEn: 'What do you think?', titleAr: 'ما رأيك؟', grammar: 'Relative clauses', writing: 'An opinion paragraph' },
  { n: 18, module: 5, titleEn: 'She said that…', titleAr: 'قالت إنّ…', grammar: 'Reported speech', writing: 'Reporting a conversation' },
  { n: 19, module: 5, titleEn: 'Pros and cons', titleAr: 'الإيجابيات والسلبيات', grammar: 'Linkers; too, enough, so, such', writing: 'A for-and-against paragraph' },
  { n: 20, module: 5, titleEn: "I'd recommend it", titleAr: 'أنصح به', grammar: 'Modals of deduction', writing: 'A review' },
]
