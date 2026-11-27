# Etapa 1: compilar Angular para produccion.
FROM node:24.15.0-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund

COPY angular.json tsconfig*.json ./
COPY src/ ./src/
COPY public/ ./public/
# Limitar los workers para la EC2 del frontend.
ENV NG_BUILD_MAX_WORKERS=1
RUN npm run build -- --configuration production --output-path=dist/agrodirecto

# Etapa 2: servir los archivos compilados con Nginx.
FROM nginx:stable-alpine
ENV API_TARGET=http://44.213.38.214:8080
ENV NGINX_ENVSUBST_FILTER=^API_TARGET$
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/agrodirecto/browser/ /usr/share/nginx/html/
EXPOSE 80
