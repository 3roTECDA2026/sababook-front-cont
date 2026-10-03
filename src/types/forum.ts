export interface Forum {
  forumId: number;
  title: string;
  description: string;
  creatorId: number;
  creatorName: string | null;
  createdAt: string;
}

export interface ForumComment {
  commentId: number;
  forumId: number;
  userId: number;
  content: string;
  createdAt: string;
  name?: string;
  email?: string;
}

export interface ForumDetailComment {
  commentId: number;
  content: string;
  createdAt: string;
  userName: string;
  userAvatar: string | null;
}

export interface ForumDetail {
  forumId: number;
  title: string;
  description: string;
  createdAt: string;
  creatorName: string | null;
  creatorAvatar: string | null;
  comments: ForumDetailComment[];
}