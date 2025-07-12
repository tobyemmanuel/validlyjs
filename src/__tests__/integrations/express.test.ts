import express, { Request, Response } from 'express';
import request from 'supertest';
import { ExpressValidator } from '../../integrations/node/express';

describe('Express Integration Tests', () => {
  let app: express.Application;
  let validator: ExpressValidator;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    validator = new ExpressValidator();
  });

  describe('ExpressValidator', () => {
    test('should validate request body successfully', async () => {
      const rules = {
        email: 'required|string|email',
        name: 'required|string|min:2'
      };

      app.post('/test', validator.body(rules), (req: Request, res: Response) => {
        res.json({ success: true, data: req.validatedData });
      });

      const response = await request(app)
        .post('/test')
        .send({ email: 'test@example.com', name: 'John' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should return validation errors for invalid data', async () => {
      const rules = {
        email: 'required|string|email',
        name: 'required|string|min:2'
      };

      app.post('/test', validator.body(rules), (req: Request, res: Response) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .send({ email: 'invalid-email', name: 'A' });

      expect(response.status).toBe(422);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toHaveProperty('email');
      expect(response.body.errors).toHaveProperty('name');
    });

    test('should validate query parameters', async () => {
      const rules = {
        page: 'required|number|min:1',
        limit: 'required|number|max:100'
      };

      app.get('/test', validator.query(rules), (req: Request, res: Response) => {
        res.json({ success: true, data: req.validatedData });
      });

      const response = await request(app)
        .get('/test?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should validate route parameters', async () => {
      const rules = {
        id: 'required|number'
      };

      app.get('/test/:id', validator.params(rules), (req: Request, res: Response) => {
        res.json({ success: true, data: req.validatedData });
      });

      const response = await request(app)
        .get('/test/123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should handle custom error handler', async () => {
      const customErrorHandler = jest.fn((errors, req, res) => {
        res.status(400).json({ custom: true, errors });
      });

      const rules = { email: 'required|string|email' };
      const customValidator = new ExpressValidator({ onError: customErrorHandler });

      app.post('/test', customValidator.body(rules), (req: Request, res: Response) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/test')
        .send({ email: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.custom).toBe(true);
      expect(customErrorHandler).toHaveBeenCalled();
    });

    test('should validate multiple sources', async () => {
      const rules = {
        email: 'required|string|email',
        id: 'required|number',
        page: 'required|number'
      };

      app.post('/test/:id', 
        validator.validate(rules, { sources: ['body', 'params', 'query'] }),
        (req: Request, res: Response) => {
          res.json({ success: true, data: req.validatedData });
        }
      );

      const response = await request(app)
        .post('/test/123?page=1')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});