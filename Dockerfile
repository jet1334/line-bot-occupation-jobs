FROM node:20-alpine

WORKDIR /app

# Copy package files first for better Docker cache
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Koyeb sets PORT automatically
EXPOSE 3000

CMD ["node", "index.js"]
