.PHONY: setup dev test lint type-check infra-up infra-down generate

setup:
	bash scripts/setup.sh

dev:
	npm run dev:all

test:
	npm run test:all

test-frontend:
	npm run test:frontend

test-backend:
	npm run test:backend

lint:
	npm run lint

type-check:
	npm run type-check

infra-up:
	npm run infra:up

infra-down:
	npm run infra:down

generate:
	@test -n "$(module)" || (echo "Usage: make generate module=<name> [domain=<domain>]" && exit 1)
	npm run generate:module -- $(module) $(if $(domain),--domain $(domain))
