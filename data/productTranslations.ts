/**
 * LUNARA - DATA: PRODUCT TRANSLATIONS (EN)
 * ============================================================================
 * คำแปลของสินค้าเริ่มต้น 12 รายการ (ภาษาไทยอยู่ใน data/products.ts)
 * - ถูกบันทึกลงฐานข้อมูลพร้อมสินค้าตอน seed ครั้งแรก
 * - สินค้าที่ admin เพิ่มเองจะแสดงข้อความตามที่กรอก (ภาษาไทย / อังกฤษ)
 * ============================================================================
 */

import type { Lang, ProductTranslation } from '../types/index.ts';

type Translations = Partial<Record<Exclude<Lang, 'th'>, ProductTranslation>>;

export const PRODUCT_TRANSLATIONS: Record<string, Translations> = {
  'prod-rose-quartz': {
    en: {
      name: 'Madagascar Rose Quartz Bracelet, Grade A+',
      tagline: 'The stone of true love, gentle charm and a healing heart',
      stone: 'Rose Quartz',
      beadSize: '8mm & 10mm (with 14K gold accents)',
      description:
        '100% natural rose quartz from Madagascar in a soft, translucent pink. Hand-selected for smooth, clear beads and finished with thick-plated 14K gold spacers that are nickel-free. Strung on durable Korean elastic for all-day comfort and gentle energy.',
      belief:
        'In crystal lore, rose quartz represents unconditional love. It is believed to open the heart chakra, draw kindness from the people around you, invite sincere relationships, soothe emotional wounds and nurture self-worth. (Personal belief, not a medical claim.)',
      careRitual:
        'Cleanse under a full moon or rest it on a clear quartz cluster. Avoid direct contact with perfume and alcohol.',
      mineralDetails: { origin: 'Madagascar', chakra: 'Heart Chakra', element: 'Earth & Water' },
    },
  },

  'prod-amethyst': {
    en: {
      name: 'Uruguay Deep Violet Amethyst Bracelet',
      tagline: 'The stone of calm, focus, intuition and a clear mind',
      stone: 'Amethyst',
      beadSize: '8mm & 10mm (extra-clear grade)',
      description:
        'Royal deep-purple amethyst, premium grade from Uruguay, with natural light play. Ideal if you want emotional calm, better focus for work and study, and deeper, more restful sleep.',
      belief:
        'Long honoured as a stone of mindfulness and higher spirit, amethyst is linked to the third-eye and crown chakras. It is believed to ease anxiety, ward off bad dreams and negative thoughts, and help you make hard decisions with clarity. (Personal belief.)',
      careRitual:
        'Cleanse with sage smoke or a singing bowl. Avoid long exposure to strong sunlight, which can fade the purple colour.',
      mineralDetails: { origin: 'Uruguay', chakra: 'Third Eye & Crown', element: 'Air / Spirit' },
    },
  },

  'prod-citrine': {
    en: {
      name: 'Natural Golden Honey Citrine Bracelet',
      tagline: "The merchant's stone for wealth, prosperity, luck and bright energy",
      stone: 'Citrine',
      beadSize: '8mm & 10mm (natural honey tone)',
      description:
        'Natural, non-heat-treated citrine in a bright golden-honey colour. Beads are chosen for clarity and a warm golden sparkle — a gem of abundance said to keep money and creative ideas flowing.',
      belief:
        'Known as "the merchant\'s stone", citrine is linked to the solar plexus chakra. It is believed not to hold negative energy but to keep turning it into positive energy, attracting business opportunities and the confidence to succeed. (Personal belief.)',
      careRitual: 'Bathe it in early-morning sunlight (07:00–08:30) for about 15 minutes, or rinse in natural mineral water.',
      mineralDetails: { origin: 'Brazil', chakra: 'Solar Plexus', element: 'Fire & Metal' },
    },
  },

  'prod-tigers-eye': {
    en: {
      name: "Golden Chatoyant Tiger's Eye Bracelet",
      tagline: 'The stone of courage, sharp vision, authority and protection',
      stone: "Tiger's Eye",
      beadSize: '8mm & 10mm (crisp tiger-stripe pattern)',
      description:
        "Hand-picked tiger's eye with sharp golden silk lines and a clear cat's-eye shimmer (chatoyancy) in every bead. Deep burnt brown cut with bright gold — calm, grounded and powerful.",
      belief:
        "Ancient warriors carried tiger's eye for safe passage and a steady mind in the face of obstacles. It is believed to activate the root and solar plexus chakras, helping you see situations clearly and stay composed. (Personal belief.)",
      careRitual: 'Bury it in clean soil overnight to restore earth energy, or rinse with clean water and dry thoroughly.',
      mineralDetails: { origin: 'South Africa', chakra: 'Root & Solar Plexus', element: 'Earth & Fire' },
    },
  },

  'prod-clear-quartz': {
    en: {
      name: 'Pure Crystal Clear Quartz Bracelet',
      tagline: 'The king of crystals — pure energy that balances and amplifies other stones',
      stone: 'Clear Quartz',
      beadSize: '8mm & 10mm (AAA+ clarity)',
      description:
        'Bubble-free, water-clear quartz crystals selected for purity, like natural dewdrops. They scatter tiny rainbows in sunlight. Wear it alone or pair it with other stones to multiply their energy.',
      belief:
        'Clear quartz is called the "master healer", working with human energy without limits. It is believed to cleanse negative energy, balance every chakra, clear the mind and amplify your intentions. (Personal belief.)',
      careRitual: 'Cleanse under natural running water, or leave it in moonlight to fully recharge.',
      mineralDetails: { origin: 'Madagascar', chakra: 'All chakras, especially Crown', element: 'Light & Water' },
    },
  },

  'prod-black-tourmaline': {
    en: {
      name: 'Black Tourmaline Shield Bracelet',
      tagline: 'The ultimate shield against negative energy, EMF and everyday stress',
      stone: 'Black Tourmaline',
      beadSize: '8mm & 10mm (deep glossy black)',
      description:
        'Genuine black tourmaline, jet black and polished smooth. A favourite among digital-age workers, it is said to create a protective energy field against electromagnetic radiation (EMF) from screens and phones.',
      belief:
        'Closely tied to the root chakra, black tourmaline is said to act like a lightning rod — drawing unhelpful energy down into the ground and turning it into steady, calm energy. Believed to protect against negativity and strengthen a grounded mind. (Personal belief.)',
      careRitual: 'Rest it on pure Himalayan salt, or smudge with palo santo to clear the energy it has absorbed.',
      mineralDetails: { origin: 'Brazil', chakra: 'Root Chakra', element: 'Earth' },
    },
  },

  'prod-elysian-harmony': {
    en: {
      name: '"Elysian Harmony" Dual-Energy Bracelet (Amethyst & Rose Quartz)',
      tagline: 'True love and a calm mind, woven together for perfect balance',
      stone: 'Amethyst & Rose Quartz',
      beadSize: '8mm (with 14K gold accents)',
      description:
        'A signature pairing: the soft, juicy pink of Madagascar rose quartz with the deep violet of Uruguayan amethyst, finished with a micron-plated 14K gold lotus charm. Gentle, calm and harmonious.',
      belief:
        'The heart and third-eye chakras work together, helping you see the truth with love rather than emotion. Believed to deepen mutual understanding, ease conflict and bring peace to relationships. (Personal belief.)',
      careRitual: 'Cleanse under a full moon, or with 528 Hz sound to balance both stones at once.',
      mineralDetails: { origin: 'Madagascar & Uruguay', chakra: 'Heart & Third Eye', element: 'Water & Air' },
    },
  },

  'prod-abundance-crown': {
    en: {
      name: '"Crown of Abundance" Wealth Bracelet (Citrine & Tiger\'s Eye)',
      tagline: 'Attract wealth, close deals and welcome golden opportunities',
      stone: "Citrine & Tiger's Eye",
      beadSize: "8mm & 10mm (luxury 14K gold accents)",
      description:
        "A power pairing for entrepreneurs: honey-gold citrine for abundance, golden-silk tiger's eye for sharp vision and precise decisions, plus a genuine 14K gold crown charm for leadership.",
      belief:
        'Connecting the solar plexus and root chakras, it is believed to awaken stability, abundance and the courage to think big and act — supporting financial luck, successful negotiations and confident investing. (Personal belief.)',
      careRitual: 'Give it 15 minutes of morning sun, or rinse in pure mineral water to energise growth.',
      mineralDetails: { origin: 'Brazil & South Africa', chakra: 'Solar Plexus & Root', element: 'Fire, Metal & Earth' },
    },
  },

  'prod-trinity-synergy': {
    en: {
      name: '"The Trinity Synergy" Tri-Energy Bracelet',
      tagline: 'Three great energies — love, wealth and wisdom — in one bracelet',
      stone: 'Rose Quartz + Citrine + Amethyst',
      beadSize: '8mm (premium 14K gold accents)',
      description:
        'A masterpiece combining three of the finest stones: rose quartz (true love), citrine (wealth) and amethyst (wisdom), arranged in carefully alternating shades for striking beauty and complete energy.',
      belief:
        'A "Trinity of Wellbeing" believed to balance emotion, action and thought, bringing harmony to work, money, love and peace of mind so life flows smoothly. (Personal belief.)',
      careRitual: 'Cleanse with a Tibetan bell or full-moon light to tune all three stones to the same frequency.',
      mineralDetails: { origin: 'Madagascar, Brazil & Uruguay', chakra: 'Heart, Solar Plexus & Crown', element: 'Earth, Water, Air & Fire' },
    },
  },

  'prod-3mm-sweet-amore': {
    en: {
      name: 'Sweet Amoré (Rose Quartz & Moonstone, 3mm faceted)',
      tagline: 'Soft 3mm faceted beads for charm, kindness and love fulfilled',
      stone: 'Rose Quartz & Moonstone (3mm faceted)',
      beadSize: '3mm faceted beads',
      description:
        'A delicate 3mm faceted bracelet in a Korean minimal style, pairing sweet pink rose quartz with blue-flashing, pearly moonstone. Easy to wear every day with any look.',
      belief: 'Believed to enhance charm and kindness, bring love to fruition and soften the heart. (Personal belief.)',
      careRitual: 'Avoid hard knocks. Rinse with clean water and pat dry.',
      mineralDetails: { origin: '100% natural', chakra: 'Heart & Sacral', element: 'Water' },
    },
  },

  'prod-3mm-pure-serenity': {
    en: {
      name: 'Pure Serenity (Howlite & White Opal, 3mm faceted)',
      tagline: 'Minimal white 3mm faceted beads to relax and welcome new hope',
      stone: 'Howlite & Opal (3mm faceted)',
      beadSize: '3mm faceted beads',
      description:
        'A calming, minimal white bracelet: natural marble-veined howlite with the soft rainbow flash of opal in 3mm faceted beads. Sits perfectly alongside a watch.',
      belief: 'Believed to relax the emotions, ease tension, quiet the mind and open you to new hope. (Personal belief.)',
      mineralDetails: { origin: '100% natural', chakra: 'Crown', element: 'Air' },
    },
  },

  'prod-3mm-verdant-luck': {
    en: {
      name: 'Verdant Luck (Green Aventurine & Peridot, 3mm faceted)',
      tagline: 'Wealth-drawing green 3mm faceted beads for good chances and kindness',
      stone: 'Green Aventurine & Peridot (3mm faceted)',
      beadSize: '3mm faceted beads',
      description:
        'A fresh, wealth-drawing green in fine 3mm faceted beads that catch the light. Green aventurine, the stone of opportunity, meets peridot, the stone of kindness.',
      belief:
        'Believed to attract good opportunities, earn the favour of elders and mentors, and support health and a peaceful life. (Personal belief.)',
      mineralDetails: { origin: '100% natural', chakra: 'Heart', element: 'Earth & Wood' },
    },
  },
};
