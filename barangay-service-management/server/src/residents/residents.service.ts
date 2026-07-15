import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resident } from '../database/schemas/resident.schema';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';

@Injectable()
export class ResidentsService {
  constructor(
    @InjectModel(Resident.name) private residentModel: Model<Resident>,
  ) {}

  async create(createResidentDto: CreateResidentDto): Promise<Resident> {
    const resident = new this.residentModel(createResidentDto);
    return resident.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{ data: Resident[]; total: number; page: number; limit: number }> {
    const query: any = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { middleName: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { purok: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.residentModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.residentModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Resident> {
    const resident = await this.residentModel.findById(id).exec();
    if (!resident) {
      throw new NotFoundException(`Resident with ID ${id} not found`);
    }
    return resident;
  }

  async update(id: string, updateResidentDto: UpdateResidentDto): Promise<Resident> {
    const resident = await this.residentModel
      .findByIdAndUpdate(id, updateResidentDto, { new: true })
      .exec();
    if (!resident) {
      throw new NotFoundException(`Resident with ID ${id} not found`);
    }
    return resident;
  }

  async remove(id: string): Promise<void> {
    const result = await this.residentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Resident with ID ${id} not found`);
    }
  }
}
