# Use official Playwright image with all browser dependencies
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Install Playwright browsers
RUN npx playwright install chromium

# Copy source
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Start server
CMD ["node", "dist/index.js"]
