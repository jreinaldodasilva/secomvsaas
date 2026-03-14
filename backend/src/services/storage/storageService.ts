import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../../config/env';

export interface StorageAdapter {
  upload(key: string, body: Buffer, contentType: string): Promise<string>;
  delete(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
}

class LocalAdapter implements StorageAdapter {
  private dir: string;

  constructor() {
    this.dir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
  }

  async upload(key: string, body: Buffer): Promise<string> {
    const filePath = path.join(this.dir, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, body);
    return `/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.dir, key);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  async getUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }
}

class S3Adapter implements StorageAdapter {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({ region: env.aws?.region || 'us-east-1' });
    this.bucket = env.aws?.s3Bucket || 'vsaas-files';
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }));
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async getUrl(key: string): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn: 3600 });
  }
}

function createAdapter(): StorageAdapter {
  if (env.aws?.s3Bucket && process.env.NODE_ENV === 'production') return new S3Adapter();
  return new LocalAdapter();
}

class StorageService {
  private adapter: StorageAdapter = createAdapter();

  generateKey(tenantId: string, originalName: string): string {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(8).toString('hex');
    return `${tenantId}/${hash}${ext}`;
  }

  async upload(tenantId: string, file: { buffer: Buffer; originalname: string; mimetype: string }): Promise<{ key: string; url: string }> {
    const key = this.generateKey(tenantId, file.originalname);
    const url = await this.adapter.upload(key, file.buffer, file.mimetype);
    return { key, url };
  }

  async delete(key: string): Promise<void> {
    await this.adapter.delete(key);
  }

  async getUrl(key: string): Promise<string> {
    return this.adapter.getUrl(key);
  }
}

export const storageService = new StorageService();
