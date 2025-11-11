export const TopicType = {
  economic: 1,
  social: 2,
  it_science: 3,
  sport: 4,
} as const;

export type TopicType = (typeof TopicType)[keyof typeof TopicType];
