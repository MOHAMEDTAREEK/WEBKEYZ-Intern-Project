import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";

describe("validationMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call next if no schemas are provided", () => {
    const middleware = validationMiddleware({});

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should validate the body and return errors if validation fails", () => {
    const bodySchema = Joi.object({
      name: Joi.string().required(),
    });

    req.body = { age: 25 }; // Missing 'name' field

    const middleware = validationMiddleware({ body: bodySchema });

    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: ['body: "name" is required'],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should validate the params and return errors if validation fails", () => {
    const paramsSchema = Joi.object({
      id: Joi.number().required(),
    });

    req.params = { id: "abc" }; // Invalid 'id', should be a number

    const middleware = validationMiddleware({ params: paramsSchema });

    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: ['params: "id" must be a number'],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should validate the query and return errors if validation fails", () => {
    const querySchema = Joi.object({
      page: Joi.number().min(1).required(),
    });

    req.query = { page: "-1" }; // Invalid 'page', should be a positive number

    const middleware = validationMiddleware({ query: querySchema });

    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: ['query: "page" must be greater than or equal to 1'],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should validate all parts of the request and return errors if any validation fails", () => {
    const bodySchema = Joi.object({
      name: Joi.string().required(),
    });
    const paramsSchema = Joi.object({
      id: Joi.number().required(),
    });
    const querySchema = Joi.object({
      page: Joi.number().min(1).required(),
    });

    req.body = { age: 25 }; // Missing 'name' field
    req.params = { id: "abc" }; // Invalid 'id', should be a number
    req.query = { page: "-1" }; // Invalid 'page', should be a positive number

    const middleware = validationMiddleware({
      body: bodySchema,
      params: paramsSchema,
      query: querySchema,
    });

    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: [
        'body: "name" is required',
        'params: "id" must be a number',
        'query: "page" must be greater than or equal to 1',
      ],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if validation passes for all parts", () => {
    const bodySchema = Joi.object({
      name: Joi.string().required(),
    });
    const paramsSchema = Joi.object({
      id: Joi.number().required(),
    });
    const querySchema = Joi.object({
      page: Joi.number().min(1).required(),
    });

    req.body = { name: "John Doe" };
    req.params = { id: "123" };
    req.query = { page: "1" };

    const middleware = validationMiddleware({
      body: bodySchema,
      params: paramsSchema,
      query: querySchema,
    });

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
