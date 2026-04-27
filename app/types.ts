export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

export interface ScoringCriteria {
  id: string;
  name: string;
  maxScore: number;
}

export interface Author {
  name: string;
  initials: string;
}

export interface Presentation {
  id: string;
  title: string;
  presentationTypeId: string;
  subCategoryId: string;
  authors: Author[];
  details: string;
}

export interface Judge {
  id: string;
  accessCode: string;
  name: string;
  credentials: string;
}

export interface AppData {
  categories: Category[];
  scoringSettings: Record<string, ScoringCriteria[]>;
  presentations: Presentation[];
  judges?: Judge[];
}
