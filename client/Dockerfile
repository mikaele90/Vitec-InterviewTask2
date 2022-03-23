FROM node:14-alpine3.15 as builder
WORKDIR /app
COPY ./package.json ./
RUN npm i
RUN npm audit fix
COPY . .
RUN npm run build

FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html