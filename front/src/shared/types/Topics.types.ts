export const TopicType = {
  Economic: 1,
  IT_Science: 2,
  Social: 3,
  Sport: 4,
} as const;

export type TopicType = (typeof TopicType)[keyof typeof TopicType];
