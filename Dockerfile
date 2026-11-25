# Frontend AgroDirecto para demostracion universitaria (Angular servido con Docker)
FROM node:24.15.0-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund

COPY angular.json tsconfig*.json proxy.conf.json ./
COPY src/ ./src/
COPY public/ ./public/

# Angular se ejecuta dentro del contenedor y queda accesible desde la EC2.
EXPOSE 4200

# El proxy /api apunta a la API AWS; solo se modifica en el contenedor.
ENV API_TARGET=http://44.213.38.214:8080
CMD ["sh", "-c", "node -e 'const fs=require(\"node:fs\");const p=JSON.parse(fs.readFileSync(\"proxy.conf.json\",\"utf8\"));p[\"/api\"].target=process.env.API_TARGET||\"http://44.213.38.214:8080\";fs.writeFileSync(\"proxy.conf.json\",JSON.stringify(p,null,2));' && npm run start -- --host 0.0.0.0 --port 4200"]
