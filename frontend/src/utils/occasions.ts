export type OccasionCategory = 'Festival' | 'Seasonal' | 'Sales' | 'Religious';

export interface Occasion {
  key: string;
  name: string;
  emoji: string;
  description: string;
  category: OccasionCategory;
  /** Two colors: the card gradient and the popup accent. */
  accent: [string, string];
  /** Suggested popup text, filled in when the occasion is picked. */
  title: string;
  message: string;
  particles: string[];
}

export const OCCASIONS: Occasion[] = [
  {
    "key": "christmas",
    "name": "Christmas",
    "emoji": "🎄",
    "description": "Classic holiday red & green with snow",
    "category": "Festival",
    "accent": [
      "#1b4332",
      "#d90429"
    ],
    "title": "Merry Christmas! 🎄",
    "message": "Wishing you a joyful holiday season filled with warmth, happiness, and wonderful memories. Happy Christmas from our team! 🎅",
    "particles": [
      "❄",
      "❅",
      "❆"
    ]
  },
  {
    "key": "halloween",
    "name": "Halloween",
    "emoji": "🎃",
    "description": "Spooky orange & black with ghosts",
    "category": "Festival",
    "accent": [
      "#ff7b00",
      "#240046"
    ],
    "title": "Happy Halloween! 🎃",
    "message": "Things are getting spooky around here! Wishing you a frightfully fun Halloween filled with treats, not tricks. 👻",
    "particles": [
      "🦇",
      "👻",
      "🕸️"
    ]
  },
  {
    "key": "new-year",
    "name": "New Year's",
    "emoji": "🎆",
    "description": "Golden confetti & fireworks celebration",
    "category": "Festival",
    "accent": [
      "#ffd60a",
      "#000814"
    ],
    "title": "Happy New Year! 🎆",
    "message": "As the new year begins, we wish you success, health, and happiness in every step of your journey. Here's to an amazing year ahead! 🥂",
    "particles": [
      "🎉",
      "✨",
      "🎊"
    ]
  },
  {
    "key": "valentines",
    "name": "Valentine's Day",
    "emoji": "💝",
    "description": "Romantic pink & red hearts everywhere",
    "category": "Festival",
    "accent": [
      "#ff8fa3",
      "#c9184a"
    ],
    "title": "Happy Valentine's Day! 💝",
    "message": "Love is in the air! Wishing you a day filled with joy, love, and sweet surprises. Happy Valentine's Day from all of us! 💌",
    "particles": [
      "💕",
      "❤️",
      "💗"
    ]
  },
  {
    "key": "easter",
    "name": "Easter",
    "emoji": "🐣",
    "description": "Pastel spring colors with egg confetti",
    "category": "Festival",
    "accent": [
      "#f9c7e2",
      "#fdf3a7"
    ],
    "title": "Happy Easter! 🐣",
    "message": "May this Easter bring you joy, peace, and sweet surprises. Wishing you a wonderful spring celebration filled with happiness! 🐰",
    "particles": [
      "🥚",
      "🌷",
      "🐰"
    ]
  },
  {
    "key": "diwali",
    "name": "Diwali",
    "emoji": "🪔",
    "description": "Festival of lights with golden sparks",
    "category": "Religious",
    "accent": [
      "#6b1e8e",
      "#f4a022"
    ],
    "title": "Happy Diwali! 🪔",
    "message": "May the festival of lights brighten your life with joy, prosperity, and happiness. Wishing you and your family a joyous Diwali! ✨",
    "particles": [
      "🪔",
      "✨",
      "🎆"
    ]
  },
  {
    "key": "thanksgiving",
    "name": "Thanksgiving",
    "emoji": "🦃",
    "description": "Warm autumn harvest with falling leaves",
    "category": "Festival",
    "accent": [
      "#7f4f24",
      "#d4a373"
    ],
    "title": "Happy Thanksgiving! 🦃",
    "message": "We are grateful for your continued support and partnership. Wishing you and your family a warm and joyful Thanksgiving celebration! 🍁",
    "particles": [
      "🍁",
      "🍂",
      "🌰"
    ]
  },
  {
    "key": "st-patricks-day",
    "name": "St. Patrick's Day",
    "emoji": "🍀",
    "description": "Lucky green shamrocks & rainbow magic",
    "category": "Festival",
    "accent": [
      "#1a5e1a",
      "#7bc67e"
    ],
    "title": "Happy St. Patrick's Day! 🍀",
    "message": "Wishing you the luck of the Irish today and always! May good fortune find you, and green be your color of joy. Sláinte! 🌈",
    "particles": [
      "🍀",
      "☘️",
      "🌈"
    ]
  },
  {
    "key": "spring-bloom",
    "name": "Spring Bloom",
    "emoji": "🌸",
    "description": "Fresh pastel greens & blossoms in full bloom",
    "category": "Seasonal",
    "accent": [
      "#2e7d32",
      "#f7b6cf"
    ],
    "title": "Spring Has Sprung! 🌸",
    "message": "Fresh starts, blooming flowers, and longer days ahead. Wishing you a wonderful spring season! 🌷",
    "particles": [
      "🌸",
      "🌷",
      "🦋"
    ]
  },
  {
    "key": "summer",
    "name": "Summer Vibes",
    "emoji": "🌊",
    "description": "Tropical beach with ocean waves & sun",
    "category": "Seasonal",
    "accent": [
      "#00b4d8",
      "#ffb703"
    ],
    "title": "Summer is Here! 🌊",
    "message": "The sun is shining and the good times are rolling! Wishing you a fantastic summer full of adventure, relaxation, and sunshine. ☀️",
    "particles": [
      "☀️",
      "🌊",
      "🍹"
    ]
  },
  {
    "key": "black-friday",
    "name": "Black Friday",
    "emoji": "🛍️",
    "description": "High-voltage sale energy with neon accents",
    "category": "Sales",
    "accent": [
      "#000000",
      "#7a1f2b"
    ],
    "title": "Black Friday Deals! 🛍️",
    "message": "The biggest sale of the year is here! Don't miss out on exclusive deals and massive savings. Limited time — shop now before it's gone! 🔥",
    "particles": [
      "🔥",
      "💥",
      "🏷️"
    ]
  },
  {
    "key": "independence-day",
    "name": "Independence Day",
    "emoji": "🇺🇸",
    "description": "Red, white & blue patriotic fireworks",
    "category": "Festival",
    "accent": [
      "#b22234",
      "#3c3b6e"
    ],
    "title": "Happy 4th of July! 🇺🇸",
    "message": "Celebrating freedom, courage, and the American spirit! Wishing you a wonderful Independence Day filled with fireworks and joy. 🎇",
    "particles": [
      "🎆",
      "⭐",
      "🎇"
    ]
  },
  {
    "key": "hanukkah",
    "name": "Hanukkah",
    "emoji": "🕎",
    "description": "Festival of Lights with blue & silver glow",
    "category": "Festival",
    "accent": [
      "#003f8a",
      "#c0c0c0"
    ],
    "title": "Happy Hanukkah! 🕎",
    "message": "Wishing you and your family eight nights of warmth, light, and joy during this beautiful Festival of Lights. Chag Sameach! ✡️",
    "particles": [
      "🕯️",
      "✡️",
      "✨"
    ]
  },
  {
    "key": "autumn-harvest",
    "name": "Autumn Harvest",
    "emoji": "🍂",
    "description": "Cozy fall palette with drifting leaves",
    "category": "Seasonal",
    "accent": [
      "#3e1a00",
      "#e07b39"
    ],
    "title": "Happy Autumn Harvest! 🍂",
    "message": "As the leaves turn golden and the air grows crisp, we celebrate the warmth of this beautiful season with you. Enjoy the harvest! 🎃",
    "particles": [
      "🍂",
      "🍁",
      "🌰"
    ]
  },
  {
    "key": "winter-wonderland",
    "name": "Winter Wonderland",
    "emoji": "❄️",
    "description": "Icy blue & white with falling snowflakes",
    "category": "Seasonal",
    "accent": [
      "#1a2a4a",
      "#5b8ecb"
    ],
    "title": "Welcome Winter! ❄️",
    "message": "Let it snow! Wishing you a magical winter season filled with cozy moments, warm gatherings, and beautiful snowfall. Stay warm! ⛄",
    "particles": [
      "❄",
      "❅",
      "⛄"
    ]
  },
  {
    "key": "ramadan",
    "name": "Ramadan",
    "emoji": "🌙",
    "description": "Sacred month of reflection with crescent moon & lanterns",
    "category": "Religious",
    "accent": [
      "#0a2540",
      "#d4af37"
    ],
    "title": "Ramadan Mubarak! 🌙",
    "message": "Wishing you a blessed month of reflection, peace, and togetherness. Ramadan Mubarak to you and your family!",
    "particles": [
      "🌙",
      "⭐",
      "🏮"
    ]
  },
  {
    "key": "eid-al-fitr",
    "name": "Eid al-Fitr",
    "emoji": "🕌",
    "description": "Joyful celebration ending Ramadan in green & gold",
    "category": "Religious",
    "accent": [
      "#0b3d2e",
      "#d4af37"
    ],
    "title": "Eid Mubarak! 🕌",
    "message": "May this Eid bring joy, prosperity, and happiness to you and your loved ones. Eid Mubarak!",
    "particles": [
      "🌙",
      "✨",
      "🕌"
    ]
  },
  {
    "key": "holi",
    "name": "Holi",
    "emoji": "🎨",
    "description": "Festival of colors with vibrant powder splashes",
    "category": "Religious",
    "accent": [
      "#ff006e",
      "#ffbe0b"
    ],
    "title": "Happy Holi! 🎨",
    "message": "May your life be filled with colors of joy, love, and happiness. Happy Holi!",
    "particles": [
      "🎨",
      "💦",
      "🌈"
    ]
  },
  {
    "key": "navratri",
    "name": "Navratri",
    "emoji": "🪘",
    "description": "Nine nights festival in red & gold splendor",
    "category": "Religious",
    "accent": [
      "#4a0404",
      "#f5a623"
    ],
    "title": "Happy Navratri! 🪘",
    "message": "May these nine nights bring you strength, joy, and prosperity. Happy Navratri!",
    "particles": [
      "🪘",
      "✨",
      "🔥"
    ]
  },
  {
    "key": "vaisakhi",
    "name": "Vaisakhi",
    "emoji": "🌾",
    "description": "Sikh harvest & new year in vibrant saffron",
    "category": "Religious",
    "accent": [
      "#7a2e00",
      "#ff9933"
    ],
    "title": "Happy Vaisakhi! 🌾",
    "message": "Wishing you a bountiful harvest and a joyous new beginning. Happy Vaisakhi!",
    "particles": [
      "🌾",
      "☀️",
      "✨"
    ]
  },
  {
    "key": "vesak",
    "name": "Vesak",
    "emoji": "🪷",
    "description": "Buddha's birthday with lotus & saffron serenity",
    "category": "Religious",
    "accent": [
      "#5c3d00",
      "#f4c95d"
    ],
    "title": "Happy Vesak! 🪷",
    "message": "May peace, compassion, and wisdom guide your path today. Happy Vesak!",
    "particles": [
      "🪷",
      "🕯️",
      "✨"
    ]
  },
  {
    "key": "rosh-hashanah",
    "name": "Rosh Hashanah",
    "emoji": "🍯",
    "description": "Jewish new year with honey gold & blue",
    "category": "Religious",
    "accent": [
      "#0a2a4d",
      "#e8b84b"
    ],
    "title": "Shanah Tovah! 🍯",
    "message": "Wishing you a sweet, healthy, and prosperous new year. Shanah Tovah!",
    "particles": [
      "🍯",
      "✡️",
      "🍎"
    ]
  },
  {
    "key": "good-friday",
    "name": "Good Friday",
    "emoji": "✝️",
    "description": "Solemn day of reflection in deep purple & gray",
    "category": "Religious",
    "accent": [
      "#2b1a3d",
      "#7d5ba6"
    ],
    "title": "Good Friday Blessings ✝️",
    "message": "A day of reflection, hope, and gratitude for all that matters. Blessings to you and your family.",
    "particles": [
      "✝️",
      "🕊️",
      "✨"
    ]
  },
  {
    "key": "eid-al-adha",
    "name": "Eid al-Adha",
    "emoji": "🐑",
    "description": "Feast of Sacrifice with warm emerald & bronze",
    "category": "Religious",
    "accent": [
      "#1b3a2f",
      "#c9a227"
    ],
    "title": "Eid Mubarak! 🐑",
    "message": "Wishing you a blessed Eid al-Adha filled with faith, family, and gratitude.",
    "particles": [
      "🐑",
      "🌙",
      "✨"
    ]
  },
  {
    "key": "yom-kippur",
    "name": "Yom Kippur",
    "emoji": "🕊️",
    "description": "Day of Atonement in solemn navy & pale blue",
    "category": "Religious",
    "accent": [
      "#0d2436",
      "#a8c5d6"
    ],
    "title": "Yom Kippur Blessings 🕊️",
    "message": "Wishing you an easy fast and a meaningful Day of Atonement.",
    "particles": [
      "🕊️",
      "✡️",
      "🕯️"
    ]
  },
  {
    "key": "passover",
    "name": "Passover",
    "emoji": "🫓",
    "description": "Festival of freedom in navy & deep wine",
    "category": "Religious",
    "accent": [
      "#0a2a4d",
      "#8b1a3d"
    ],
    "title": "Chag Pesach Sameach! 🫓",
    "message": "Wishing you a joyous and meaningful Passover with family and freedom.",
    "particles": [
      "🫓",
      "✡️",
      "🍷"
    ]
  },
  {
    "key": "guru-nanak-jayanti",
    "name": "Guru Nanak Jayanti",
    "emoji": "🙏",
    "description": "Gurpurab lights in deep blue & saffron",
    "category": "Religious",
    "accent": [
      "#0d3b66",
      "#ff9f1c"
    ],
    "title": "Happy Gurpurab! 🙏",
    "message": "Celebrating the light and teachings of Guru Nanak Dev Ji. Wishing you peace and wisdom.",
    "particles": [
      "🙏",
      "🕯️",
      "✨"
    ]
  },
  {
    "key": "maha-shivaratri",
    "name": "Maha Shivaratri",
    "emoji": "🔱",
    "description": "Night of Shiva in deep midnight & icy blue",
    "category": "Religious",
    "accent": [
      "#0a1f33",
      "#4fc3d9"
    ],
    "title": "Happy Maha Shivaratri! 🔱",
    "message": "May Lord Shiva bless you with peace, strength, and spiritual awakening.",
    "particles": [
      "🔱",
      "🕉️",
      "✨"
    ]
  },
  {
    "key": "raksha-bandhan",
    "name": "Raksha Bandhan",
    "emoji": "🎗️",
    "description": "Sibling bond festival in deep rose & gold",
    "category": "Religious",
    "accent": [
      "#7a1030",
      "#f5c451"
    ],
    "title": "Happy Raksha Bandhan! 🎗️",
    "message": "Celebrating the beautiful bond of love and protection between siblings.",
    "particles": [
      "🎗️",
      "💛",
      "✨"
    ]
  },
  {
    "key": "bodhi-day",
    "name": "Bodhi Day",
    "emoji": "🌳",
    "description": "Buddha's enlightenment in deep forest green",
    "category": "Religious",
    "accent": [
      "#0d2b1a",
      "#8bc34a"
    ],
    "title": "Happy Bodhi Day! 🌳",
    "message": "Celebrating the day of enlightenment with peace, mindfulness, and gratitude.",
    "particles": [
      "🌳",
      "🍃",
      "✨"
    ]
  },
  {
    "key": "mawlid-al-nabi",
    "name": "Mawlid al-Nabi",
    "emoji": "🌟",
    "description": "The Prophet's birthday in emerald & soft gold",
    "category": "Religious",
    "accent": [
      "#0a3d24",
      "#e8c468"
    ],
    "title": "Mawlid Mubarak! 🌟",
    "message": "Celebrating the birth of the Prophet Muhammad ﷺ with peace, love, and reflection.",
    "particles": [
      "🌟",
      "🕌",
      "✨"
    ]
  },
  {
    "key": "palm-sunday",
    "name": "Palm Sunday",
    "emoji": "🌿",
    "description": "Start of Holy Week in green & soft gold",
    "category": "Religious",
    "accent": [
      "#1b4d3e",
      "#a8d5ba"
    ],
    "title": "Blessed Palm Sunday 🌿",
    "message": "Welcoming Holy Week with hope, faith, and reflection.",
    "particles": [
      "🌿",
      "🕊️",
      "✨"
    ]
  }
];

export const OCCASION_CATEGORIES: OccasionCategory[] = ['Festival', 'Seasonal', 'Sales', 'Religious'];

export function findOccasion(key: string | undefined | null): Occasion | undefined {
  return OCCASIONS.find((o) => o.key === key);
}
