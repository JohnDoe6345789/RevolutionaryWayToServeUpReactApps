FROM node:18-bullseye-slim

WORKDIR /app

# Install dependencies before copying the entire repo to leverage layer caching.
COPY package*.json ./
RUN npm ci

COPY . .

# Ensure Cypress keeps its cache inside the container for reproducible runs.
ENV CYPRESS_CACHE_FOLDER=/root/.cache/Cypress

# Run the serve+test script that already exists in package.json.
CMD ["npm", "run", "cy:run"]
