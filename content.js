// Hardcoded phase content and recipes. Not fetched, not generated at runtime.
// No medical claims — this is "what I plan to eat and do," not treatment.
//
// Every recipe is gluten-free. Quantities in `ingredients` are written for
// `baseServings` ADULT portions; the app scales them (a toddler counts as
// half an adult portion) and doubles them when Leftovers is ticked.
//
// qty: null means "to taste" / no fixed amount — never scaled.

const RECIPES = {
  // ---------- BREAKFASTS ----------

  "eggs-spinach-toast": {
    name: "Scrambled eggs with spinach on toast",
    meal: "breakfast",
    baseServings: 2,
    time: "10 min",
    tags: ["gluten-free", "vegetarian"],
    ingredients: [
      { item: "eggs", qty: 4, unit: "" },
      { item: "baby spinach", qty: 60, unit: "g" },
      { item: "gluten-free bread", qty: 4, unit: "slices" },
      { item: "butter", qty: 20, unit: "g" },
      { item: "milk", qty: 2, unit: "tbsp" },
      { item: "salt and pepper", qty: null, unit: "" },
    ],
    method: [
      "Whisk the eggs with the milk and a pinch of salt.",
      "Melt half the butter in a non-stick pan over low heat. Add the spinach and cook until just wilted, then set aside.",
      "Add the rest of the butter, pour in the eggs and stir slowly with a spatula until just set — take them off the heat while still slightly glossy.",
      "Toast the bread, fold the spinach through the eggs and pile on top.",
    ],
    note: "For the toddlers: keep their eggs plain and chop the spinach finely, or leave it out.",
  },

  "yoghurt-berries-seeds": {
    name: "Greek yoghurt with berries and seeds",
    meal: "breakfast",
    baseServings: 2,
    time: "5 min",
    tags: ["gluten-free", "vegetarian"],
    ingredients: [
      { item: "Greek yoghurt", qty: 400, unit: "g" },
      { item: "mixed berries", qty: 200, unit: "g" },
      { item: "pumpkin seeds", qty: 30, unit: "g" },
      { item: "honey", qty: 2, unit: "tsp" },
      { item: "gluten-free granola", qty: 60, unit: "g" },
    ],
    method: [
      "Spoon the yoghurt into bowls.",
      "Top with berries, granola and pumpkin seeds.",
      "Drizzle with honey.",
    ],
    note: "No honey for under-1s. Seeds can be a choking risk for toddlers — grind them or leave them off.",
  },

  "berry-spinach-smoothie": {
    name: "Berry and spinach smoothie",
    meal: "breakfast",
    baseServings: 2,
    time: "5 min",
    tags: ["gluten-free", "vegetarian"],
    ingredients: [
      { item: "frozen mixed berries", qty: 200, unit: "g" },
      { item: "baby spinach", qty: 40, unit: "g" },
      { item: "banana", qty: 1, unit: "" },
      { item: "Greek yoghurt", qty: 150, unit: "g" },
      { item: "milk", qty: 300, unit: "ml" },
      { item: "chia seeds", qty: 1, unit: "tbsp" },
    ],
    method: [
      "Put everything in a blender.",
      "Blend until completely smooth, about a minute.",
      "Add a splash more milk if it's too thick to pour.",
    ],
    note: "Toddlers usually take this happily in a cup — make theirs a smaller pour.",
  },

  "porridge-banana-almond": {
    name: "Porridge with banana and almond butter",
    meal: "breakfast",
    baseServings: 2,
    time: "10 min",
    tags: ["gluten-free", "vegetarian"],
    ingredients: [
      { item: "gluten-free rolled oats", qty: 100, unit: "g" },
      { item: "milk", qty: 500, unit: "ml" },
      { item: "banana", qty: 2, unit: "" },
      { item: "almond butter", qty: 2, unit: "tbsp" },
      { item: "cinnamon", qty: 1, unit: "tsp" },
      { item: "honey", qty: 2, unit: "tsp" },
    ],
    method: [
      "Put the oats and milk in a saucepan over medium heat.",
      "Stir often for 5-7 minutes until thick and creamy.",
      "Stir through the cinnamon.",
      "Serve topped with sliced banana, a spoon of almond butter and a drizzle of honey.",
    ],
    note: "Check the oats are certified gluten-free — most standard oats are cross-contaminated.",
  },

  "banana-oat-pancakes": {
    name: "Banana and oat pancakes",
    meal: "breakfast",
    baseServings: 2,
    time: "20 min",
    tags: ["gluten-free", "vegetarian"],
    ingredients: [
      { item: "gluten-free rolled oats", qty: 100, unit: "g" },
      { item: "banana", qty: 2, unit: "" },
      { item: "eggs", qty: 3, unit: "" },
      { item: "baking powder (gluten-free)", qty: 1, unit: "tsp" },
      { item: "milk", qty: 100, unit: "ml" },
      { item: "butter", qty: 20, unit: "g" },
    ],
    method: [
      "Blitz the oats in a blender until they look like flour.",
      "Add the bananas, eggs, baking powder and milk, and blend to a smooth batter.",
      "Melt a little butter in a non-stick pan over medium-low heat.",
      "Cook spoonfuls of batter for 2 minutes a side, until bubbles form and the edges set.",
    ],
    note: "These freeze well — a good one to make a double batch of for toddler breakfasts.",
  },

  "eggs-avocado-toast": {
    name: "Boiled eggs with avocado on toast",
    meal: "breakfast",
    baseServings: 2,
    time: "12 min",
    tags: ["gluten-free", "vegetarian", "dairy-free"],
    ingredients: [
      { item: "eggs", qty: 4, unit: "" },
      { item: "avocado", qty: 1, unit: "" },
      { item: "gluten-free bread", qty: 4, unit: "slices" },
      { item: "lemon", qty: 0.5, unit: "" },
      { item: "olive oil", qty: 1, unit: "tbsp" },
      { item: "salt and pepper", qty: null, unit: "" },
    ],
    method: [
      "Boil the eggs for 7 minutes for jammy yolks, then cool them under cold water and peel.",
      "Mash the avocado with the lemon juice, olive oil, salt and pepper.",
      "Toast the bread and spread the avocado over.",
      "Halve the eggs and sit them on top.",
    ],
    note: "Toddlers: mash their egg into the avocado and serve on toast fingers.",
  },

  // ---------- LUNCHES ----------

  "beef-lentil-soup": {
    name: "Beef and lentil soup",
    meal: "lunch",
    baseServings: 2,
    time: "45 min",
    tags: ["gluten-free", "dairy-free"],
    ingredients: [
      { item: "beef mince", qty: 300, unit: "g" },
      { item: "dried brown lentils", qty: 150, unit: "g" },
      { item: "carrot", qty: 2, unit: "" },
      { item: "celery", qty: 2, unit: "sticks" },
      { item: "brown onion", qty: 1, unit: "" },
      { item: "garlic", qty: 2, unit: "cloves" },
      { item: "tinned chopped tomatoes", qty: 400, unit: "g" },
      { item: "gluten-free beef stock", qty: 1, unit: "L" },
      { item: "olive oil", qty: 1, unit: "tbsp" },
    ],
    method: [
      "Dice the onion, carrot and celery. Soften them in the oil in a large pot for 8 minutes.",
      "Add the garlic, then the mince, breaking it up and browning it.",
      "Add the lentils, tomatoes and stock. Bring to a simmer.",
      "Cook for 30 minutes, until the lentils are soft. Season well.",
    ],
    note: "Blend a portion smooth for the toddlers, or serve as-is if they'll manage the lentils. Freezes well.",
  },

  "chicken-citrus-salad": {
    name: "Grilled chicken salad with citrus dressing",
    meal: "lunch",
    baseServings: 2,
    time: "20 min",
    tags: ["gluten-free", "dairy-free"],
    ingredients: [
      { item: "chicken breast", qty: 400, unit: "g" },
      { item: "mixed salad leaves", qty: 120, unit: "g" },
      { item: "cucumber", qty: 1, unit: "" },
      { item: "cherry tomatoes", qty: 200, unit: "g" },
      { item: "avocado", qty: 1, unit: "" },
      { item: "orange", qty: 1, unit: "" },
      { item: "olive oil", qty: 3, unit: "tbsp" },
      { item: "Dijon mustard", qty: 1, unit: "tsp" },
    ],
    method: [
      "Flatten the chicken slightly, season, and grill or pan-fry 5-6 minutes a side until cooked through. Rest, then slice.",
      "Whisk the juice of the orange with the olive oil and mustard.",
      "Toss the leaves, cucumber, tomatoes and avocado with the dressing.",
      "Top with the sliced chicken.",
    ],
    note: "Toddlers: give them plain chicken strips, cucumber sticks and avocado on the side rather than dressed salad.",
  },

  "quinoa-rainbow-bowl": {
    name: "Quinoa rainbow bowl",
    meal: "lunch",
    baseServings: 2,
    time: "25 min",
    tags: ["gluten-free", "vegetarian"],
    ingredients: [
      { item: "quinoa", qty: 150, unit: "g" },
      { item: "tinned chickpeas", qty: 400, unit: "g" },
      { item: "red capsicum", qty: 1, unit: "" },
      { item: "cucumber", qty: 1, unit: "" },
      { item: "cherry tomatoes", qty: 150, unit: "g" },
      { item: "red cabbage", qty: 100, unit: "g" },
      { item: "feta", qty: 80, unit: "g" },
      { item: "lemon", qty: 1, unit: "" },
      { item: "olive oil", qty: 3, unit: "tbsp" },
    ],
    method: [
      "Rinse the quinoa well, then simmer in double its volume of water for 12-15 minutes. Drain and cool slightly.",
      "Drain and rinse the chickpeas. Finely shred the cabbage and chop the capsicum, cucumber and tomatoes.",
      "Toss everything with the lemon juice and olive oil.",
      "Crumble the feta over the top.",
    ],
    note: "Keep the toddlers' portions plain: quinoa, chickpeas and chopped cucumber, no dressing.",
  },

  "sweet-potato-chickpea-bowl": {
    name: "Roast sweet potato and chickpea bowl",
    meal: "lunch",
    baseServings: 2,
    time: "35 min",
    tags: ["gluten-free", "vegetarian", "dairy-free"],
    ingredients: [
      { item: "sweet potato", qty: 600, unit: "g" },
      { item: "tinned chickpeas", qty: 400, unit: "g" },
      { item: "baby spinach", qty: 60, unit: "g" },
      { item: "tahini", qty: 2, unit: "tbsp" },
      { item: "lemon", qty: 1, unit: "" },
      { item: "ground cumin", qty: 1, unit: "tsp" },
      { item: "olive oil", qty: 2, unit: "tbsp" },
    ],
    method: [
      "Heat the oven to 200°C. Cut the sweet potato into chunks.",
      "Toss the sweet potato and drained chickpeas with the oil and cumin, spread on a tray and roast for 25-30 minutes.",
      "Whisk the tahini with the lemon juice and enough water to make a pourable dressing.",
      "Pile the roast vegetables onto the spinach and spoon the dressing over.",
    ],
    note: "Roast extra sweet potato — it reheats well and toddlers usually eat it plain.",
  },

  "tuna-rice-salad": {
    name: "Tuna and rice salad",
    meal: "lunch",
    baseServings: 2,
    time: "15 min",
    tags: ["gluten-free", "dairy-free"],
    ingredients: [
      { item: "tinned tuna", qty: 190, unit: "g" },
      { item: "cooked rice", qty: 300, unit: "g" },
      { item: "cherry tomatoes", qty: 150, unit: "g" },
      { item: "cucumber", qty: 1, unit: "" },
      { item: "tinned corn", qty: 125, unit: "g" },
      { item: "olive oil", qty: 2, unit: "tbsp" },
      { item: "lemon", qty: 1, unit: "" },
    ],
    method: [
      "Drain the tuna and corn.",
      "Chop the cucumber and halve the tomatoes.",
      "Fork everything through the cooked rice.",
      "Dress with the olive oil and lemon juice, and season.",
    ],
    note: "A good use for leftover rice from the night before. Cool cooked rice quickly and use within a day.",
  },

  "chicken-fried-rice": {
    name: "Chicken and vegetable fried rice",
    meal: "lunch",
    baseServings: 2,
    time: "20 min",
    tags: ["gluten-free", "dairy-free"],
    ingredients: [
      { item: "cooked rice (cold)", qty: 400, unit: "g" },
      { item: "chicken thigh", qty: 300, unit: "g" },
      { item: "eggs", qty: 2, unit: "" },
      { item: "frozen peas", qty: 150, unit: "g" },
      { item: "carrot", qty: 1, unit: "" },
      { item: "tamari (gluten-free soy sauce)", qty: 2, unit: "tbsp" },
      { item: "spring onion", qty: 2, unit: "" },
      { item: "sesame oil", qty: 1, unit: "tbsp" },
    ],
    method: [
      "Dice the chicken and fry in a hot wok until golden and cooked through. Set aside.",
      "Scramble the eggs in the same pan, then set aside with the chicken.",
      "Fry the diced carrot for 3 minutes, add the peas and the cold rice, and toss over high heat.",
      "Return the chicken and egg, add the tamari and sesame oil, and finish with sliced spring onion.",
    ],
    note: "Use tamari, not regular soy sauce — most soy sauce contains wheat.",
  },

  // ---------- DINNERS ----------

  "slow-beef-lentils": {
    name: "Slow-cooked beef with lentils and rice",
    meal: "dinner",
    baseServings: 2,
    time: "3 hrs (mostly unattended)",
    tags: ["gluten-free", "dairy-free"],
    ingredients: [
      { item: "beef chuck", qty: 600, unit: "g" },
      { item: "dried brown lentils", qty: 200, unit: "g" },
      { item: "brown onion", qty: 1, unit: "" },
      { item: "carrot", qty: 2, unit: "" },
      { item: "garlic", qty: 3, unit: "cloves" },
      { item: "tinned chopped tomatoes", qty: 400, unit: "g" },
      { item: "gluten-free beef stock", qty: 500, unit: "ml" },
      { item: "rice", qty: 300, unit: "g" },
      { item: "olive oil", qty: 2, unit: "tbsp" },
    ],
    method: [
      "Cut the beef into large chunks, season, and brown well in the oil in a heavy pot. Do it in batches.",
      "Add the diced onion, carrot and garlic and cook for 5 minutes.",
      "Return the beef with the tomatoes and stock. Cover and simmer very gently for 2 hours (or 150°C in the oven).",
      "Add the lentils and cook a further 40 minutes, until both beef and lentils are soft.",
      "Cook the rice and serve alongside.",
    ],
    note: "The iron-rich one for your menstrual phase. Makes excellent leftovers — tick the box and it does two nights.",
  },

  "chicken-stirfry-noodles": {
    name: "Chicken and vegetable stir-fry with rice noodles",
    meal: "dinner",
    baseServings: 2,
    time: "25 min",
    tags: ["gluten-free", "dairy-free"],
    ingredients: [
      { item: "chicken thigh", qty: 400, unit: "g" },
      { item: "rice noodles", qty: 200, unit: "g" },
      { item: "broccoli", qty: 1, unit: "head" },
      { item: "red capsicum", qty: 1, unit: "" },
      { item: "carrot", qty: 1, unit: "" },
      { item: "tamari (gluten-free soy sauce)", qty: 3, unit: "tbsp" },
      { item: "garlic", qty: 2, unit: "cloves" },
      { item: "fresh ginger", qty: 1, unit: "tbsp" },
      { item: "sesame oil", qty: 1, unit: "tbsp" },
    ],
    method: [
      "Soak the rice noodles in hot water per the packet, then drain.",
      "Slice the chicken and stir-fry over high heat until golden and cooked through.",
      "Add the garlic, ginger and sliced vegetables and toss for 4-5 minutes — keep them with some bite.",
      "Add the noodles and tamari, toss to coat, and finish with the sesame oil.",
    ],
    note: "Toddlers: pull out plain noodles, chicken and carrot before you add the tamari (it's salty).",
  },

  "salmon-roast-veg": {
    name: "Grilled salmon with roasted vegetables",
    meal: "dinner",
    baseServings: 2,
    time: "35 min",
    tags: ["gluten-free", "dairy-free"],
    ingredients: [
      { item: "salmon fillets", qty: 2, unit: "" },
      { item: "pumpkin", qty: 400, unit: "g" },
      { item: "zucchini", qty: 2, unit: "" },
      { item: "red onion", qty: 1, unit: "" },
      { item: "olive oil", qty: 2, unit: "tbsp" },
      { item: "lemon", qty: 1, unit: "" },
      { item: "salt and pepper", qty: null, unit: "" },
    ],
    method: [
      "Heat the oven to 200°C. Chop the pumpkin, zucchini and onion, toss with the oil and roast for 25 minutes.",
      "Season the salmon. Pan-fry skin-side down for 4 minutes, then 2 minutes on the flesh side.",
      "Squeeze lemon over the salmon and serve on the roasted vegetables.",
    ],
    note: "Check carefully for bones before giving salmon to the toddlers.",
  },

  "salmon-sweet-potato-mash": {
    name: "Baked salmon with sweet potato mash",
    meal: "dinner",
    baseServings: 2,
    time: "35 min",
    tags: ["gluten-free"],
    ingredients: [
      { item: "salmon fillets", qty: 2, unit: "" },
      { item: "sweet potato", qty: 700, unit: "g" },
      { item: "butter", qty: 30, unit: "g" },
      { item: "green beans", qty: 200, unit: "g" },
      { item: "lemon", qty: 1, unit: "" },
      { item: "olive oil", qty: 1, unit: "tbsp" },
    ],
    method: [
      "Heat the oven to 190°C. Peel and chop the sweet potato and boil for 15-20 minutes until tender.",
      "Put the salmon on a lined tray, drizzle with oil, season, and bake for 12-14 minutes.",
      "Steam the beans for 4 minutes.",
      "Mash the sweet potato with the butter. Serve with the salmon and a squeeze of lemon.",
    ],
    note: "Sweet potato mash is reliably toddler-friendly — make extra.",
  },

  "gf-bolognese": {
    name: "Spaghetti bolognese with gluten-free pasta",
    meal: "dinner",
    baseServings: 2,
    time: "50 min",
    tags: ["gluten-free", "dairy-free"],
    ingredients: [
      { item: "beef mince", qty: 500, unit: "g" },
      { item: "gluten-free spaghetti", qty: 300, unit: "g" },
      { item: "tinned chopped tomatoes", qty: 800, unit: "g" },
      { item: "brown onion", qty: 1, unit: "" },
      { item: "carrot", qty: 1, unit: "" },
      { item: "celery", qty: 1, unit: "stick" },
      { item: "garlic", qty: 3, unit: "cloves" },
      { item: "tomato paste", qty: 2, unit: "tbsp" },
      { item: "olive oil", qty: 2, unit: "tbsp" },
    ],
    method: [
      "Finely dice the onion, carrot and celery and soften in the oil for 10 minutes.",
      "Add the garlic and tomato paste, cook a minute, then brown the mince.",
      "Add the tomatoes, season, and simmer at least 30 minutes — longer is better.",
      "Cook the gluten-free pasta (it overcooks fast, so start tasting early) and toss through.",
    ],
    note: "The reliable one. Doubles and freezes perfectly — worth ticking Leftovers.",
  },

  "roast-chicken-veg": {
    name: "Roast chicken with vegetables",
    meal: "dinner",
    baseServings: 4,
    time: "1 hr 30 min",
    tags: ["gluten-free", "dairy-free"],
    ingredients: [
      { item: "whole chicken", qty: 1.4, unit: "kg" },
      { item: "potatoes", qty: 800, unit: "g" },
      { item: "carrot", qty: 3, unit: "" },
      { item: "brown onion", qty: 1, unit: "" },
      { item: "olive oil", qty: 2, unit: "tbsp" },
      { item: "rosemary", qty: 2, unit: "sprigs" },
      { item: "lemon", qty: 1, unit: "" },
    ],
    method: [
      "Heat the oven to 200°C. Put the halved lemon and rosemary inside the chicken, rub the skin with oil and season.",
      "Roast for 20 minutes, then add the chopped potatoes, carrots and onion around it.",
      "Roast a further 50-60 minutes, until the juices run clear at the thigh.",
      "Rest the chicken for 15 minutes before carving.",
    ],
    note: "Written for 4 adult portions rather than 2 — the app accounts for that. Leftover chicken makes the fried rice.",
  },
};

const CONTENT = {
  menstrual: {
    label: "Menstrual",
    color: "#B23A48",
    summary: "Lower energy is normal here. Rest without guilt.",
    food: {
      focus: "Warm, iron-rich, easy to digest.",
      eat: ["Red meat or lentils", "Dark leafy greens", "Ginger and warming spices"],
      // Several options per meal so a long phase doesn't mean the same
      // dinner every night. The app rotates through them across the week.
      meals: {
        breakfast: ["eggs-spinach-toast", "porridge-banana-almond", "banana-oat-pancakes"],
        lunch: ["beef-lentil-soup", "chicken-fried-rice", "sweet-potato-chickpea-bowl"],
        dinner: ["slow-beef-lentils", "gf-bolognese", "roast-chicken-veg"],
      },
    },
    training: {
      focus: "Low intensity. Move because it feels good, not to push.",
      do: ["20-minute walk", "Gentle yoga or stretching"],
      avoid: "Heavy lifting or high-intensity intervals.",
    },
  },
  follicular: {
    label: "Follicular",
    color: "#4E8C6D",
    summary: "Energy climbing. A good window to start something new.",
    food: {
      focus: "Lighter, fresh, protein to fuel building energy.",
      eat: ["Eggs and lean protein", "Fermented foods", "Citrus and fresh herbs"],
      meals: {
        breakfast: ["yoghurt-berries-seeds", "eggs-avocado-toast", "berry-spinach-smoothie"],
        lunch: ["chicken-citrus-salad", "tuna-rice-salad", "quinoa-rainbow-bowl"],
        dinner: ["chicken-stirfry-noodles", "salmon-roast-veg", "roast-chicken-veg"],
      },
    },
    training: {
      focus: "Ramp intensity up. The body recovers faster now.",
      do: ["Interval running session", "Strength training — new PB attempts welcome"],
      avoid: "Nothing in particular — this is the window to push.",
    },
  },
  ovulatory: {
    label: "Ovulatory",
    color: "#C98A2C",
    summary: "Peak energy and strength. Make the most of it.",
    food: {
      focus: "Light, antioxidant-rich, support high output.",
      eat: ["Colourful vegetables", "Berries", "Fibre-rich whole grains"],
      meals: {
        breakfast: ["berry-spinach-smoothie", "yoghurt-berries-seeds", "eggs-avocado-toast"],
        lunch: ["quinoa-rainbow-bowl", "chicken-citrus-salad", "tuna-rice-salad"],
        dinner: ["salmon-roast-veg", "chicken-stirfry-noodles", "roast-chicken-veg"],
      },
    },
    training: {
      focus: "Highest capacity of the cycle. Go hard.",
      do: ["Heavy strength session", "High-intensity interval training", "A race or time trial if one's on"],
      avoid: "Wasting this window on an easy session.",
    },
  },
  luteal: {
    label: "Luteal",
    color: "#5B5490",
    summary: "Energy tapers off through this phase. Steadier, calmer effort.",
    food: {
      focus: "Steady blood sugar, magnesium, complex carbs.",
      eat: ["Dark chocolate", "Sweet potato and other complex carbs", "Nuts and seeds"],
      meals: {
        breakfast: ["porridge-banana-almond", "banana-oat-pancakes", "eggs-spinach-toast"],
        lunch: ["sweet-potato-chickpea-bowl", "chicken-fried-rice", "beef-lentil-soup"],
        dinner: ["salmon-sweet-potato-mash", "gf-bolognese", "slow-beef-lentils"],
      },
    },
    training: {
      focus: "Wind intensity back down as the phase progresses.",
      do: ["Moderate cardio", "Pilates or mobility work"],
      avoid: "Maxing out new PBs — save those for follicular/ovulatory.",
    },
  },
};

// A line for the home screen, rotating daily. Tone is matched to the phase:
// gentle and funny when energy is low, inspirational as it climbs, sassy at
// the peak, wry when the luteal irritability lands.
//
// These are written for this app rather than quoted from anyone — no
// attribution problems, and the tone can be tuned exactly to the phase.
const QUOTES = {
  menstrual: [
    { text: "Rest is not the reward for finishing. It's part of the work.", tone: "inspirational" },
    { text: "You are allowed to cancel things. That is what phones are for.", tone: "funny" },
    { text: "Today's ambition: horizontal, and warm.", tone: "quirky" },
    { text: "The washing will still be there tomorrow. It is very loyal like that.", tone: "funny" },
    { text: "Low energy is not a character flaw. It's a Tuesday.", tone: "fun" },
    { text: "Be as kind to yourself as you'd be to someone you love.", tone: "inspirational" },
    { text: "Hot water bottle: still undefeated.", tone: "quirky" },
  ],
  follicular: [
    { text: "This is the week the ideas come back. Write them down.", tone: "inspirational" },
    { text: "Start the thing. You can always make it better later.", tone: "inspirational" },
    { text: "Fresh page energy. Use it before it wanders off.", tone: "fun" },
    { text: "Say yes to something slightly too ambitious today.", tone: "fun" },
    { text: "Your brain is on your side this week. Take the advantage.", tone: "inspirational" },
    { text: "New week, new haircut ideas you will not act on.", tone: "funny" },
    { text: "Momentum is easier to keep than to find. Go.", tone: "inspirational" },
  ],
  ovulatory: [
    { text: "Peak everything. Absolutely insufferable, and entirely earned.", tone: "sassy" },
    { text: "You didn't come this far to be quiet about it.", tone: "sassy" },
    { text: "Take up the whole room. It's yours this week.", tone: "sassy" },
    { text: "Ask for the thing. The worst answer is no.", tone: "inspirational" },
    { text: "If not now, when? Genuinely. This is the window.", tone: "fun" },
    { text: "Main character energy, and this time it's hormonal fact.", tone: "sassy" },
    { text: "Go be excellent, and just a little smug about it.", tone: "sassy" },
  ],
  luteal: [
    { text: "Everything is fine. Everyone is annoying. Both can be true.", tone: "funny" },
    { text: "Snacks are a legitimate coping strategy.", tone: "funny" },
    { text: "Lower the bar. Then step over it triumphantly.", tone: "quirky" },
    { text: "You do not have to fix your entire life tonight.", tone: "inspirational" },
    { text: "Nothing needs deciding today. Especially not that.", tone: "inspirational" },
    { text: "If someone chews loudly today, that is on them.", tone: "sassy" },
    { text: "Feelings are big this week. They are also temporary.", tone: "inspirational" },
    { text: "Cancel it. Wear the soft trousers. Nobody is watching.", tone: "quirky" },
  ],
};

const DIETARY_OPTIONS = [
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
  { id: "vegetarian", label: "Vegetarian" },
];

if (typeof module !== "undefined") {
  module.exports = { CONTENT, RECIPES, QUOTES, DIETARY_OPTIONS };
}
