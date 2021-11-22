FROM node:11.1.0 as builder

WORKDIR /app
ADD . /app
RUN cd /app/resources && npm install && npm run gulp deps

FROM nginx:1.20-alpine

COPY --from=builder /app /usr/share/nginx/html
