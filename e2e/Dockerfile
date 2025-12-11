FROM mcr.microsoft.com/playwright:1.55.0-focal

WORKDIR /app

COPY . .

WORKDIR /app/e2e
RUN npm ci
RUN npx playwright install --with-deps

CMD ["npm", "run", "test"]
