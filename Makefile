UNIONCOM-FRONTEND-IMAGE := $(shell docker images -q unioncom-frontend:latest)

stop:
	@docker-compose stop
	@docker-compose rm -f

start:
	@npm run build
ifneq ($(strip $(UNIONCOM-FRONTEND-IMAGE)),)
	@docker rmi $(UNIONCOM-FRONTEND-IMAGE)
endif
	@docker-compose up -d --build

logs:
	@docker-compose logs -f --tail=200

generate-ssl: ##@lets-encrypt generate ssl cert
	@docker-compose -f generate-ssl.yml up -d
	@sleep 5
	certbot certonly --verbose --agree-tos --noninteractive \
		--quiet --email="lixucheng@ziggurat.cn" --webroot -w nginx/certs \
		-d $(DOMAIN_NAME)
	@docker-compose -f generate-ssl.yml down

renew-ssl:
	@docker-compose -f generate-ssl.yml up -d
	@sleep 5
	certbot renew
	@docker-compose -f generate-ssl.yml down
