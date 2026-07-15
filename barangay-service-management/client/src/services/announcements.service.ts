import axios from '../api/axios';
import type { Announcement } from '../types';

export interface AnnouncementsResponse {
  data: Announcement[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  imageUrl?: string;
}

export const announcementsService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    published?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<AnnouncementsResponse> {
    const { data } = await axios.get<AnnouncementsResponse>('/announcements', { params });
    return data;
  },

  async getAllPublished(): Promise<Announcement[]> {
    const { data } = await axios.get<Announcement[]>('/announcements/published');
    return data;
  },

  async getById(id: string): Promise<Announcement> {
    const { data } = await axios.get<Announcement>(`/announcements/${id}`);
    return data;
  },

  async create(input: CreateAnnouncementInput): Promise<Announcement> {
    const { data } = await axios.post<Announcement>('/announcements', input);
    return data;
  },

  async update(id: string, input: UpdateAnnouncementInput): Promise<Announcement> {
    const { data } = await axios.patch<Announcement>(`/announcements/${id}`, input);
    return data;
  },

  async publish(id: string): Promise<Announcement> {
    const { data } = await axios.patch<Announcement>(`/announcements/${id}/publish`);
    return data;
  },

  async unpublish(id: string): Promise<Announcement> {
    const { data } = await axios.patch<Announcement>(`/announcements/${id}/unpublish`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`/announcements/${id}`);
  },
};
