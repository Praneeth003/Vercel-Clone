# Vercel-Clone

How to setup Redis locally through Docker:

docker pull redis:latest
docker run -d --name my-redis -p 6379:6379 redis:latest

docker exec -it my-redis redis-cli
