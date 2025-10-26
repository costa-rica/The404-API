server {
    server_name kv20-manager.dashanddata.com;
    client_max_body_size 10G;

    location / {
        proxy_pass http://192.100.168.21:8002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 600s;  # Sets the timeout to 600 seconds
    }

    location /static {
        proxy_pass http://192.100.168.21:8002/static;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 600s;  # Sets the timeout to 600 seconds
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/kv20-manager.dashanddata.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/kv20-manager.dashanddata.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}server {
    if ($host = kv20-manager.dashanddata.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name kv20-manager.dashanddata.com;
    return 404; # managed by Certbot


}