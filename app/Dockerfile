FROM node:lts-alpine3.16

ENV TOKEN_KEY=cincai
ENV MAIL_USER=elisabetsobeck11@gmail.com
ENV MAIL_PASS=fmxictgaiclpxenf
ENV BASE_URL=https://e-quiz.xyz
ENV DATABASE_URL=postgresql://postgres:jtJHCOFy5sGOUqwk@db.yjgvgegeqpalylqjdjxr.supabase.co:5432/postgres
ENV MIDTRANS_AUTH=Basic U0ItTWlkLXNlcnZlci1xV0ZibGxyTnZBUEVvMldITG4yVTlaOTI6'
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production && npm cache clean --force

COPY . .

CMD ["npm", "run", "start"]
