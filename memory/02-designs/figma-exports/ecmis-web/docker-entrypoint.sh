#!/bin/sh
# Inject API URL into appsettings.json at container start
API_URL="${ADMIN_API_URL:-http://localhost:5001/}"

if grep -q '"EcmisAdmin"' /usr/share/nginx/html/appsettings.json; then
    sed -i "s|\"EcmisAdmin\": \"[^\"]*\"|\"EcmisAdmin\": \"$API_URL\"|g" /usr/share/nginx/html/appsettings.json
fi

exec nginx -g "daemon off;"
