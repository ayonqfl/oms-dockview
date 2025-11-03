# Use lightweight Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose Vite default dev port
EXPOSE 5173

# Run Vite dev server with host binding for Docker
CMD ["npm", "run", "dev", "--", "--host"]
