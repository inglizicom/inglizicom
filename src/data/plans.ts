export interface Plan {
  id:              string
  label_ar:        string
  duration_months: number
  amount_mad:      number
  highlight?:      boolean
  savings_label?:  string
}

export const PLANS: Plan[] = [
  {
    id:              'paid-1m',
    label_ar:        'اشتراك شهر',
    duration_months: 1,
    amount_mad:      300,
  },
  {
    id:              'paid-3m',
    label_ar:        'اشتراك 3 أشهر',
    duration_months: 3,
    amount_mad:      750,
    highlight:       true,
    savings_label:   'وفّر 150 درهم',
  },
  {
    id:              'paid-12m',
    label_ar:        'اشتراك سنوي',
    duration_months: 12,
    amount_mad:      2400,
    savings_label:   'وفّر 1200 درهم',
  },
]

export function getPlan(id: string): Plan | undefined {
  return PLANS.find(p => p.id === id)
}

export const BANK_DETAILS = {
  bank_name:      'البنك الشعبي',
  account_holder: 'Inglizi.com',
  account_number: 'XXXX XXXX XXXX XXXX',
  rib:            'XXX XXX XXXXXXXXXXXXXX XX',
  swift:          'BCPOMAMC',
}

export const PAYMENT_WHATSAPP = '+212707902091'
