export interface ContentSalon { id: string; name: string; status: string }
export interface ContentPhoto { kind: string; id: string; name: string; url: string | null }
export interface ContentDetail { id: string; name: string; gallery: string[]; photos: ContentPhoto[] }
export interface ContentReview { id: string; customerName: string; createdAt: string; rating: number; comment: string; salonReply: string }
