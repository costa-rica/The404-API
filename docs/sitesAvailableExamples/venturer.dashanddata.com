server {
    server_name venturer.dashanddata.com;
    client_max_body_size 1G;

    location / {
        proxy_pass http://192.168.100.211:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 600s;  # Sets the timeout to 600 seconds
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/venturer.dashanddata.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/venturer.dashanddata.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = venturer.dashanddata.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name venturer.dashanddata.com;
    return 404; # managed by Certbot


}