// Hardcoded phase content. Not fetched, not generated at runtime. No medical claims —
// this is "what I plan to do," not "what treats symptoms."

const CONTENT = {
  menstrual: {
    label: "Menstrual",
    color: "#B23A48",
    summary: "Lower energy is normal here. Rest without guilt.",
    food: {
      focus: "Warm, iron-rich, easy to digest.",
      eat: ["Red meat or lentils", "Dark leafy greens", "Ginger and warming spices"],
      meals: [
        "Breakfast: scrambled eggs on toast with spinach",
        "Lunch: beef and lentil soup with crusty bread",
        "Dinner: slow-cooked beef and lentils with rice",
      ],
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
      meals: [
        "Breakfast: greek yoghurt with berries and seeds",
        "Lunch: grilled chicken salad with citrus dressing",
        "Dinner: stir-fried tofu and vegetables with rice noodles",
      ],
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
      meals: [
        "Breakfast: smoothie with spinach, berries and protein",
        "Lunch: rainbow buddha bowl with quinoa",
        "Dinner: grilled salmon with roasted vegetables",
      ],
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
      meals: [
        "Breakfast: porridge with banana and almond butter",
        "Lunch: roast sweet potato and chickpea bowl",
        "Dinner: baked salmon with sweet potato mash",
      ],
    },
    training: {
      focus: "Wind intensity back down as the phase progresses.",
      do: ["Moderate cardio", "Pilates or mobility work"],
      avoid: "Maxing out new PBs — save those for follicular/ovulatory.",
    },
  },
};

if (typeof module !== "undefined") {
  module.exports = { CONTENT };
}
