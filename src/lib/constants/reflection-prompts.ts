export const REFLECTION_PROMPTS = [
  "What matters most today?",
  "What's one thing you're avoiding?",
  "Where did your energy go today?",
  "What would make tomorrow feel lighter?",
  "What are you proud of this week?",
  "What's weighing on you right now?",
];

export function pickReflectionPrompt(seed = Date.now()) {
  return REFLECTION_PROMPTS[seed % REFLECTION_PROMPTS.length];
}
