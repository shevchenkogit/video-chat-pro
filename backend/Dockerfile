FROM node:18-alpine

WORKDIR /usr/src/api

# Копіюємо файли конфігурації
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо все інше (включаючи папку src та app.js)
COPY . .

# Запуск
CMD ["npm", "run", "start"]