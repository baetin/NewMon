export interface examplesType {
  id: number;
  image_url: string;
  title: string;
  summary: string;
  compare: {
    ai_summary: string;
    original: string;
  };
}
