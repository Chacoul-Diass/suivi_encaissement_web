# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock to install dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy all project files to the container
COPY . .

# Build the Next.js application
RUN yarn build

# Remove development dependencies
RUN yarn install --production --ignore-scripts --prefer-offline

# Stage 2: Setup production image with a minimal base
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public


# Make sure to copy either the `pages` or `app` directory (whichever you're using)
COPY --from=builder /app/pages ./pages   
COPY --from=builder /app/app ./app      
COPY --from=builder /app/components ./components      
COPY --from=builder /app/styles ./styles      
COPY --from=builder /app/utils ./utils      
COPY --from=builder /app/store ./store          

COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Set environment variables for production
# ENV NODE_ENV=production
ENV PORT=2403

# Expose the port that the app runs on
EXPOSE 2403

# Start the application
CMD ["yarn", "start"]