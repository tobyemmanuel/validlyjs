import Fastify, { FastifyInstance } from 'fastify';
import {
  FastifyValidator,
  validlyPlugin,
} from '../../integrations/node/fastify';

describe('Fastify Integration Tests', () => {
  let fastify: FastifyInstance;
  let validator: FastifyValidator;

  beforeEach(async () => {
    fastify = Fastify();
    validator = new FastifyValidator();
  });

  afterEach(async () => {
    await fastify.close();
  });

  describe('FastifyValidator', () => {
    test('should validate request body successfully', async () => {
      const rules = {
        email: 'required|string|email',
        name: 'required|string|min:2',
      };

      fastify.post(
        '/test',
        {
          preHandler: validator.body(rules),
        },
        async (request, reply) => {
          return { success: true, data: (request as any).validatedData };
        }
      );

      const response = await fastify.inject({
        method: 'POST',
        url: '/test',
        payload: { email: 'test@example.com', name: 'John' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    test('should return validation errors for invalid data', async () => {
      const rules = {
        email: 'required|string|email',
        name: 'required|string|min:2',
      };

      fastify.post(
        '/test',
        {
          preHandler: validator.body(rules),
        },
        async (request, reply) => {
          return { success: true };
        }
      );

      const response = await fastify.inject({
        method: 'POST',
        url: '/test',
        payload: { email: 'invalid-email', name: 'A' },
      });

      expect(response.statusCode).toBe(422);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Validation failed');
      expect(body.errors).toHaveProperty('email');
      expect(body.errors).toHaveProperty('name');
    });

    test('should validate query parameters', async () => {
      const rules = {
        page: 'required|number|min:1',
        limit: 'required|number|max:100',
      };

      fastify.get(
        '/test',
        {
          preHandler: validator.query(rules),
        },
        async (request, reply) => {
          return { success: true, data: (request as any).validatedData };
        }
      );

      const response = await fastify.inject({
        method: 'GET',
        url: '/test?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    test('should validate route parameters', async () => {
      const rules = {
        id: 'required|number',
      };

      fastify.get(
        '/test/:id',
        {
          preHandler: validator.params(rules),
        },
        async (request, reply) => {
          return { success: true, data: (request as any).validatedData };
        }
      );

      const response = await fastify.inject({
        method: 'GET',
        url: '/test/123',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe('Fastify Plugin', () => {
    test('should register plugin and provide validation methods', async () => {
      // Register the plugin
      await fastify.register(validlyPlugin);

      const rules = { email: 'required|string|email' };

      fastify.post(
        '/test',
        {
          preHandler: fastify.validateBody(rules),
        },
        async (request, reply) => {
          return { success: true };
        }
      );

      // Now call ready() after all routes are defined
      await fastify.ready();

      expect(typeof fastify.validateBody).toBe('function');
      expect(typeof fastify.validateQuery).toBe('function');
      expect(typeof fastify.validateParams).toBe('function');
      expect(typeof fastify.validate).toBe('function');

      // Test the route
      const response = await fastify.inject({
        method: 'POST',
        url: '/test',
        payload: { email: 'test@example.com' },
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
