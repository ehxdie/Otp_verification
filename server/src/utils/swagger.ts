import swaggerJSDoc from "swagger-jsdoc";
import type { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express, Request, Response } from "express";

const options: Options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "OTP Verification API",
      version: "1.0.0",
      description:
        "API for phone number OTP verification using Termii SMS gateway",
    },
    schemes: ["http", "https"],
    servers: [{ url: "http://localhost:5000/api/v1" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/api/**/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);

export function swaggerDocs(app: Express, port: number | string) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(`📖 Docs available at http://localhost:${port}/docs`);
}

export default swaggerDocs;
