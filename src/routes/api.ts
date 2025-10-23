import { FastifyPluginAsync } from 'fastify';
import { TimeResponse, EchoRequest, EchoResponse } from '../types';
import { isSEA } from '../config';

const apiRoutes: FastifyPluginAsync = async (fastify) => {
  // Time endpoint
  const timeSchema = {
    description: 'Get current timestamp information',
    tags: ['api'],
    response: {
      200: {
        type: 'object',
        properties: {
          timestamp: { type: 'string' },
          unixTime: { type: 'number' },
          timezone: { type: 'string' },
          isSEA: { type: 'boolean' },
          iso8601: { type: 'string' },
          locale: { type: 'string' },
        },
      },
    },
  };

  fastify.get<{ Reply: TimeResponse }>('/api/time', { schema: timeSchema }, async (request, reply) => {
    const timeData = fastify.systemService.getTime();
    
    reply
      .code(200)
      .type('application/json')
      .send(timeData);
  });

  // Echo endpoint
  const echoSchema = {
    description: 'Echo back the request data',
    tags: ['api'],
    body: {
      type: 'object',
      additionalProperties: true,
    },
    response: {
      200: {
        type: 'object',
        properties: {
          echo: { type: 'object' },
          received: { type: 'string' },
          from: { type: 'string' },
          isSEA: { type: 'boolean' },
          headers: { type: 'object' },
          requestId: { type: 'string' },
        },
      },
    },
  };

  fastify.post<{ 
    Body: EchoRequest;
    Reply: EchoResponse;
  }>('/api/echo', { schema: echoSchema }, async (request, reply) => {
    const requestId = request.headers['x-request-id'] as string;
    
    const response: EchoResponse = {
      echo: request.body,
      received: new Date().toISOString(),
      from: request.ip,
      isSEA,
      headers: request.headers,
      requestId,
    };

    reply
      .code(200)
      .type('application/json')
      .send(response);
  });
};

export default apiRoutes;