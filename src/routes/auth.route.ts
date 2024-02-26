import { Router } from "express";
import { check } from "express-validator";

import authController from "../controllers/auth.controller";
import validateMiddleware from "../middleware/validate.middleware";
import authMiddleware from "../middleware/auth.middleware";

const authRouter = Router();

/**
 * @swagger
 *
 * {
  "/api/auth/register": {
    "description": "Endpoint for user registration.",
    "post": {
      "summary": "Register as a new user",
      "tags": ["authentication"],
      "consumes": ["application/json"],
      "produces": ["application/json"],
      "parameters": [{
        "in": "body",
        "name": "body",
        "required": true,
        "description": "JSON object containing user registration details.",
        "schema": {
          "first_name": "string",
          "last_name": "string",
          "email": "string",
          "password": "string",
          "confirmPassword": "string",
          "address": "string",
          "dob": "string"
        },
        "content":{
          [
            "application/json":{

              "example": {
                "first_name": "string",
                "last_name": "string",
                "email": "string",
                "password": "string",
                "confirmPassword": "string",
                "address": "string",
                "dob": "string"
              },
            }
          ]
        }
      }],
      "responses": {
        "201": {
          "description": "successful",
          "content": {
            "application/json": {
              "example": {
                "success": true,
                "data": {
                  "id": "902e1b42-3e3d-4aed-9c90-0632b70296c6",
                  "first_name": "john",
                  "last_name": "doe",
                  "email": "johndoe@example.com",
                  "address": "earth",
                  "dob": "23/01/1999",
                  "role": "user",
                  "created_at": "2023-12-27T11:01:14.140Z"
                }
              }
            }
          }
        },
        "400": {
          "description": "bad request body",
          "content": {
            "application/json": {
              "example": {
                "success": false,
                "error": "password and confirmPassword do not match"
              }
            }
          }
        },
        "409": {
          "description": "user already exists",
          "content": {
            "application/json": {
              "example": {
                "success": false,
                "error": "user already exists"
              }
            }
          }
        },
        "500": {
          "description": "server error",
          "content": {
            "application/json": {
              "example": {
                "success": false,
                "error": "internal server error"
              }
            }
          }
        }
      }
    },
    "authentication": {
      "required": true,
      "type": "API key"
    },
    "queryParameters": {
      "none": "No additional query parameters for this endpoint."
    },
    "errorHandling": {
      "details": "Errors are returned in JSON format in the response body.",
      "examples": {
        "passwordMismatch": {
          "success": false,
          "error": "password and confirmPassword do not match"
        },
        "userExists": {
          "success": false,
          "error": "user already exists"
        },
        "serverError": {
          "success": false,
          "error": "internal server error"
        }
      }
    },
    "examples": {
      "successfulRegistration": {
        "request": {
          "first_name": "John",
          "last_name": "Doe",
          "email": "johndoe@example.com",
          "password": "securepassword",
          "confirmPassword": "securepassword",
          "address": "Earth",
          "dob": "23/01/1999"
        },
        "response": {
          "success": true,
          "data": {
            "id": "902e1b42-3e3d-4aed-9c90-0632b70296c6",
            "first_name": "john",
            "last_name": "doe",
            "email": "johndoe@example.com",
            "address": "earth",
            "dob": "23/01/1999",
            "role": "user",
            "created_at": "2023-12-27T11:01:14.140Z"
          }
        }
      },
      "badRequest": {
        "request": {
          "first_name": "John",
          "last_name": "Doe",
          "email": "johndoe@example.com",
          "password": "securepassword",
          "confirmPassword": "differentpassword",
          "address": "Earth",
          "dob": "23/01/1999"
        },
        "response": {
          "success": false,
          "error": "passwords do not match"
        }
      }
    }
  }
}

 */
authRouter.post(
  "/register",
  check("email")
    .exists()
    .notEmpty()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("invalid email address"),
  check("firstName").exists().notEmpty().trim().exists(),
  check("lastName").exists().notEmpty().trim().exists(),
  check("dob")
    .exists()
    .notEmpty()
    .trim()
    .exists()
    .isDate()
    .withMessage("invalid date. use YYYY-MM-DD format"),
  check("password")
    .trim()
    .exists()
    .isStrongPassword()
    .withMessage("password not strong enough"),
  check("confirmPassword")
    .exists()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("passwords do not match"),
  validateMiddleware.validateInput,
  authController.register,
);

/**
 * @swagger
 *
 * /api/auth/login:
 *  post:
 *    summary: Log in to application
 *    tags:
 *      - authentication
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    responses:
 *      201:
 *        description: successful
 *      400:
 *        description:  bad request body
 */
authRouter.post(
  "/login",
  check("email").exists().notEmpty().isEmail().normalizeEmail(),
  check("password").exists().notEmpty(),
  validateMiddleware.validateInput,
  authController.login,
);

authRouter.post(
  "/verify/:token",
  check("email").exists().notEmpty().isEmail().normalizeEmail(),
  validateMiddleware.validateInput,
  authController.verifyEmail,
);

/**
 * @swagger
 *
 * /api/auth/logout:
 *  post:
 *    summary: Log out of appplication
 *    tags:
 *      - authentication
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    responses:
 *      201:
 *        description: successful
 *      400:
 *        description:  bad request body
 */
authRouter.post(
  "/logout",
  authMiddleware.authenticateToken,
  authController.logout,
);

/**
 * @swagger
 *
 * /api/auth/refresh:
 *  post:
 *    summary: Refresh access tokens
 *    tags:
 *      - authentication
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    responses:
 *      201:
 *        description: successful
 *        content:
 *          application/json:
 *            example:
 *
 *      400:
 *        description:  bad request body
 */
authRouter.post(
  "/refresh",
  authMiddleware.authenticateToken,
  authController.refreshToken,
);

/**
 * @swagger
 *
 * /api/auth/forgot-password:
 *  post:
 *    summary: Request to reset password
 *    tags:
 *      - authentication
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    responses:
 *      201:
 *        description: successful
 *      400:
 *        description:  bad request body
 */
authRouter.post(
  "/forgot-password",
  check("email").exists().notEmpty().isEmail().normalizeEmail(),
  authController.forgotPassword,
);

/**
 * @swagger
 *
 * /api/auth/reset-password/{token}:
 *  post:
 *    summary: Reset password
 *    tags:
 *      - authentication
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    responses:
 *      201:
 *        description: successful
 *      400:
 *        description:  bad request body
 *      409:
 *        description:  user already exists
 */
authRouter.post(
  "/reset-password/:token",
  check("email").exists().notEmpty().isEmail().normalizeEmail(),
  check("password")
    .exists()
    .trim()
    .isStrongPassword()
    .withMessage("password not strong enough"),
  check("confirmPassword")
    .exists()
    .custom((value, { req }) => value === req.body.password),
  authController.resetPassword,
);

export default authRouter;