/**
 * LUNARA - DATA: 24 LUCKY STONES TRANSLATIONS (EN)
 * ============================================================================
 * ชื่อภาษาอังกฤษใช้ nameEn จาก data/stones.ts
 * ============================================================================
 */

import type { Lang } from '../types';

export interface StoneText {
  name?: string;
  tagline: string;
  meaning: string;
}

export const STONE_TRANSLATIONS: Record<string, Partial<Record<Exclude<Lang, 'th'>, StoneText>>> = {
  opal: {
    en: { tagline: 'The gem of love and hope', meaning: 'A gem of love and hope that enhances charm and goodwill.' },
  },
  rhodonite: {
    en: { tagline: 'The rescue stone for love and relationships', meaning: 'A "rescue stone" for love and relationships that helps heal heartache and build understanding.' },
  },
  apatite: {
    en: { tagline: 'Inspiration, determination, calm', meaning: 'Builds inspiration, determination and emotional calm.' },
  },
  citrine: {
    en: { tagline: 'Wealth, fortune, abundance, energy', meaning: 'A money-drawing stone of fortune and abundance, full of positive, bright energy.' },
  },
  rhodochrosite: {
    en: { tagline: 'Love and healing', meaning: 'Pure love and emotional healing; draws soulmates and true friendship.' },
  },
  pyrite: {
    en: { tagline: 'Fortune, confidence, protection from negativity', meaning: 'Fortune and confidence — "fool\'s gold" that is truly valuable, shielding against negative energy.' },
  },
  turquoise: {
    en: { tagline: 'The stone of wisdom, mindfulness and healing', meaning: 'A stone of wisdom, mindfulness and healing power, protecting you on your travels.' },
  },
  sodalite: {
    en: { tagline: 'Sincerity, a calm mind, communication', meaning: 'Sincerity and a calm mind; improves communication and smooth negotiation.' },
  },
  'yellow-tigers-eye': {
    en: { tagline: 'The stone of luck and fortune', meaning: 'A stone of luck and fortune with sharp vision and confident money decisions.' },
  },
  peridot: {
    en: { tagline: '"The stone of kindness" for luck and health', meaning: 'The stone of kindness; boosts luck and wellbeing of body and mind, and blows away worries.' },
  },
  'green-aventurine': {
    en: { tagline: 'The stone of opportunity and positivity', meaning: 'The stone of opportunity and possibility; positive energy that attracts wealth and good luck.' },
  },
  sunstone: {
    en: { tagline: 'Abundance, bold thinking, intelligence', meaning: 'The stone of abundance — bold thinking and action, intelligence and a bright outlook.' },
  },
  onyx: {
    en: { tagline: 'Mindfulness, focus, stability, self-control', meaning: 'Mindfulness, focus, stability and self-control; protects against harm and bad energy.' },
  },
  'lapis-lazuli': {
    en: { tagline: 'Finance, wisdom, prosperity', meaning: 'Finance, wisdom and prosperity — an ancient sacred stone that clears the mind.' },
  },
  labradorite: {
    en: { tagline: 'Fortune, career, charm', meaning: 'Fortune, career and charm — the rainbow-flashing "wizard stone" that lights the way to success.' },
  },
  howlite: {
    en: { tagline: 'The stone of learning, calm and ease', meaning: 'The stone of learning, calm and ease; relieves stress and anger.' },
  },
  amethyst: {
    en: { tagline: '"Queen of crystals" — protection and fortune', meaning: 'The queen of crystals: protective power and fortune, boosting focus for study and restful sleep.' },
  },
  aquamarine: {
    en: { tagline: 'Safe travels, loyalty', meaning: 'Safe travels, loyalty, and a gentle heart as clear as the sea.' },
  },
  tourmaline: {
    en: { tagline: 'Protection, prosperity, progress', meaning: 'Protection, prosperity and progress; balances yin and yang.' },
  },
  amazonite: {
    en: { tagline: 'Truth, courage', meaning: 'The stone of truth and courage; strengthens decision-making and trustworthy speech.' },
  },
  garnet: {
    en: { tagline: 'Love, fortune, health, vitality', meaning: 'Love, fortune, health and vitality; refuels your drive and desire.' },
  },
  'strawberry-quartz': {
    en: { tagline: 'Love, charm, an open heart', meaning: 'Love, charm and an open heart; attracts bright, joyful love and smiles.' },
  },
  moonstone: {
    en: { tagline: '"The traveller\'s stone" — love and charm', meaning: "The traveller's stone: love, charm, gentleness and emotional balance." },
  },
  'rose-quartz': {
    en: { tagline: 'The stone of the heart — love, trust, forgiveness', meaning: 'The stone of the heart: love, trust and forgiveness, drawing warm love and kindness.' },
  },
};
