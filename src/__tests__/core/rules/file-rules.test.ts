import { describe, it, expect, beforeEach } from '@jest/globals';
import { Validator } from '../../../core/validator';
import { ValidationSchema } from '../../../types';

describe('Core Validator - File Rules', () => {
  let validator: Validator;

  // Mock File object for testing
  const createMockFile = (name: string, size: number, type: string) => {
    return {
      name,
      size,
      type,
      lastModified: Date.now(),
      webkitRelativePath: ''
    } as File;
  };

  describe('Basic File Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        avatar: 'file',
        document: 'file|required',
        optional: 'file|optional'
      };
      validator = new Validator(schema);
    });

    it('validates file objects', async () => {
      const data = {
        avatar: createMockFile('avatar.jpg', 1024, 'image/jpeg'),
        document: createMockFile('doc.pdf', 2048, 'application/pdf')
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on non-file objects', async () => {
      const data = {
        avatar: 'not-a-file',
        document: { name: 'fake-file' }
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(2);
    });
  });

  describe('File Size Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        smallFile: 'file|max:1024', // 1KB max
        largeFile: 'file|min:2048', // 2KB min
        rangeFile: 'file|between:1024,4096', // 1KB-4KB
        exactFile: 'file|size:2048' // exactly 2KB
      };
      validator = new Validator(schema);
    });

    it('validates file sizes', async () => {
      const data = {
        smallFile: createMockFile('small.txt', 512, 'text/plain'),
        largeFile: createMockFile('large.pdf', 3072, 'application/pdf'),
        rangeFile: createMockFile('medium.jpg', 2048, 'image/jpeg'),
        exactFile: createMockFile('exact.doc', 2048, 'application/msword')
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid file sizes', async () => {
      const data = {
        smallFile: createMockFile('large.txt', 2048, 'text/plain'), // too large
        largeFile: createMockFile('small.pdf', 1024, 'application/pdf'), // too small
        rangeFile: createMockFile('huge.jpg', 8192, 'image/jpeg'), // outside range
        exactFile: createMockFile('wrong.doc', 1024, 'application/msword') // wrong size
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
    });
  });

  describe('File Type Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        image: 'file|extensions:jpg,png,gif',
        document: 'file|extensions:pdf,doc,docx',
        video: 'file|extensions:mp4,avi,mov'
      };
      validator = new Validator(schema);
    });

    it('validates file types', async () => {
      const data = {
        image: createMockFile('photo.jpg', 1024, 'image/jpeg'),
        document: createMockFile('report.pdf', 2048, 'application/pdf'),
        video: createMockFile('clip.mp4', 4096, 'video/mp4')
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on invalid file types', async () => {
      const data = {
        image: createMockFile('audio.mp3', 1024, 'audio/mpeg'),
        document: createMockFile('image.jpg', 2048, 'image/jpeg'),
        video: createMockFile('text.txt', 4096, 'text/plain')
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
    });
  });

  describe('Image Specific Validation', () => {
    beforeEach(() => {
      const schema: ValidationSchema = {
        profilePic: 'file|image',
        // thumbnail: 'file|image|min_width:100|minHeight:100',
        // banner: 'file|image|max_width:1920|maxHeight:1080'
      };
      validator = new Validator(schema);
    });

    it('validates image files', async () => {
      const data = {
        profilePic: createMockFile('profile.jpg', 1024, 'image/jpeg'),
        thumbnail: createMockFile('thumb.png', 512, 'image/png'),
        banner: createMockFile('banner.gif', 2048, 'image/gif')
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(true);
    });

    it('fails on non-image files', async () => {
      const data = {
        profilePic: createMockFile('document.pdf', 1024, 'application/pdf'),
        thumbnail: createMockFile('audio.mp3', 512, 'audio/mpeg'),
        banner: createMockFile('video.mp4', 2048, 'video/mp4')
      };

      const result = await validator.validate(data);
      expect(result.isValid).toBe(false);
    });
  });
});