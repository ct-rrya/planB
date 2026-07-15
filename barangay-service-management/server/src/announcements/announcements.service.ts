import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Announcement } from '../database/schemas/announcement.schema';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectModel(Announcement.name) private announcementModel: Model<Announcement>,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, userId: string): Promise<Announcement> {
    const announcement = new this.announcementModel({
      ...createAnnouncementDto,
      createdBy: userId,
      published: false,
    });

    const savedAnnouncement = await announcement.save();

    const populatedAnnouncement = await this.announcementModel
      .findById(savedAnnouncement._id)
      .populate('createdBy', 'username')
      .exec();

    if (!populatedAnnouncement) {
      throw new NotFoundException(`Announcement with ID ${savedAnnouncement._id} not found`);
    }

    return populatedAnnouncement;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    published?: boolean,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{ data: Announcement[]; total: number; page: number; limit: number }> {
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (published !== undefined) {
      query.published = published;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.announcementModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'username')
        .exec(),
      this.announcementModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findAllPublished(): Promise<Announcement[]> {
    return this.announcementModel
      .find({ published: true })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username')
      .exec();
  }

  async findOne(id: string): Promise<Announcement> {
    const announcement = await this.announcementModel
      .findById(id)
      .populate('createdBy', 'username')
      .exec();

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return announcement;
  }

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto): Promise<Announcement> {
    const announcement = await this.announcementModel
      .findByIdAndUpdate(id, updateAnnouncementDto, { new: true })
      .populate('createdBy', 'username')
      .exec();

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return announcement;
  }

  async publish(id: string): Promise<Announcement> {
    const announcement = await this.announcementModel
      .findByIdAndUpdate(id, { published: true }, { new: true })
      .populate('createdBy', 'username')
      .exec();

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return announcement;
  }

  async unpublish(id: string): Promise<Announcement> {
    const announcement = await this.announcementModel
      .findByIdAndUpdate(id, { published: false }, { new: true })
      .populate('createdBy', 'username')
      .exec();

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return announcement;
  }

  async remove(id: string): Promise<void> {
    const result = await this.announcementModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
  }
}
