FROM nginx:1.15.3-alpine

COPY dist/docs /usr/share/nginx/html
