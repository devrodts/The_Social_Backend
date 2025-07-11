import { ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloDriver } from "@nestjs/apollo";
import { join } from "path";

export const graphqlConfig: ApolloDriverConfig = {
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), "src/schema.gql"),
  sortSchema: true,
  playground: process.env.NODE_ENV !== "production",
  introspection: process.env.NODE_ENV !== "production",
  context: ({ req }) => ({ req }),
  formatError: (error) => {
    interface OriginalError {
      message: string;
      statusCode?: number;
      error?: string;
    }
    const originalError = error.extensions?.originalError as OriginalError;
    if (originalError) {
      return {
        message: originalError.message,
        statusCode: originalError.statusCode,
        error: originalError.error,
      };
    }
    return error;
  },
};
