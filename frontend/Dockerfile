FROM nginx:alpine AS build
COPY index.html /tmp/

FROM nginx:alpine
COPY --from=build /tmp/index.html /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
