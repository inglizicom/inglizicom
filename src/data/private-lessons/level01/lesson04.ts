import type { Unit } from '../types'

export const lesson04: Unit = {
  id: 104,
  slug: 'l1-review-conv1',
  emoji: '💬',
  level: 'A0 – A1',
  title: { en: 'Full Conversation — Lessons 1 to 3', ar: 'محادثة شاملة — الدروس 1 إلى 3' },
  sections: [
    { kind: 'cover' },
    {
      kind: 'conversation',
      title: 'Hamza & Sara — full introduction',
      note: 'هذه محادثة شاملة تجمع كل ما تعلمناه في الدروس 1 و2 و3.',
      lines: [
        { speaker: 'Hamza', text: 'Hello! I am Hamza. Nice to meet you.' },
        { speaker: 'Sara',  text: 'Hi Hamza! I am Sara. Nice to meet you too.' },
        { speaker: 'Hamza', text: 'How are you today, Sara?' },
        { speaker: 'Sara',  text: 'I am good, thank you. How do you spell your name?' },
        { speaker: 'Hamza', text: 'H - A - M - Z - A. And you?' },
        { speaker: 'Sara',  text: 'S - A - R - A. Simple!' },
        { speaker: 'Hamza', text: 'How old are you?' },
        { speaker: 'Sara',  text: 'I am twenty-seven. And you?' },
        { speaker: 'Hamza', text: 'I am thirty-one. Where are you from?' },
        { speaker: 'Sara',  text: 'I am from Spain — I am Spanish. And you?' },
        { speaker: 'Hamza', text: 'I am Moroccan. I live in Casablanca.' },
        { speaker: 'Sara',  text: 'Oh nice! I live in Madrid. What is your phone number?' },
        { speaker: 'Hamza', text: 'My number is 07 65 43 21 32. And you?' },
        { speaker: 'Sara',  text: 'Mine is 06 10 00 00 67.' },
        { speaker: 'Hamza', text: 'Are you married?' },
        { speaker: 'Sara',  text: 'No, I am single. And you?' },
        { speaker: 'Hamza', text: 'I am married. What is your job?' },
        { speaker: 'Sara',  text: 'I am a nurse. And you?' },
        { speaker: 'Hamza', text: 'I am a teacher. It was nice to meet you, Sara.' },
        { speaker: 'Sara',  text: 'You too, Hamza! See you tomorrow.' },
      ],
    },
  ],
}
