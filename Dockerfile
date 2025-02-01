# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Step 5: Install PM2 globally
RUN npm install pm2@latest -g

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["pm2-runtime", "ecosystem.config.js"]