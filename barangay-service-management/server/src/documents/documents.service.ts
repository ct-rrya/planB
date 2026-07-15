import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentType } from '../database/schemas/document-type.schema';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentType.name) private documentTypeModel: Model<DocumentType>,
  ) {}

  async create(createDocumentTypeDto: CreateDocumentTypeDto): Promise<DocumentType> {
    // Check if name already exists
    const existing = await this.documentTypeModel
      .findOne({ name: createDocumentTypeDto.name })
      .exec();
    
    if (existing) {
      throw new ConflictException('Document type with this name already exists');
    }

    const documentType = new this.documentTypeModel(createDocumentTypeDto);
    return documentType.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    isActive?: boolean,
  ): Promise<{ data: DocumentType[]; total: number; page: number; limit: number }> {
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.documentTypeModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.documentTypeModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<DocumentType> {
    const documentType = await this.documentTypeModel.findById(id).exec();
    if (!documentType) {
      throw new NotFoundException(`Document type with ID ${id} not found`);
    }
    return documentType;
  }

  async update(id: string, updateDocumentTypeDto: UpdateDocumentTypeDto): Promise<DocumentType> {
    // If updating name, check for uniqueness
    if (updateDocumentTypeDto.name) {
      const existing = await this.documentTypeModel
        .findOne({ name: updateDocumentTypeDto.name, _id: { $ne: id } })
        .exec();
      
      if (existing) {
        throw new ConflictException('Document type with this name already exists');
      }
    }

    const documentType = await this.documentTypeModel
      .findByIdAndUpdate(id, updateDocumentTypeDto, { new: true })
      .exec();
    
    if (!documentType) {
      throw new NotFoundException(`Document type with ID ${id} not found`);
    }
    
    return documentType;
  }

  async remove(id: string): Promise<void> {
    // Soft delete by setting isActive to false
    const documentType = await this.documentTypeModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    
    if (!documentType) {
      throw new NotFoundException(`Document type with ID ${id} not found`);
    }
  }

  async toggleActive(id: string): Promise<DocumentType> {
    const documentType = await this.findOne(id);
    documentType.isActive = !documentType.isActive;
    return documentType.save();
  }
}
