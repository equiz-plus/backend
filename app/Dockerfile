FROM node:lts-alpine3.16

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production && npm cache clean --force

COPY . .

CMD ["npm", "run", "start"]
