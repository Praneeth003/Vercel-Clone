# Vercel-Clone

How to setup Redis locally through Docker:

docker pull redis:latest

docker run -d --name my-redis -p 6379:6379 redis:latest

docker exec -it my-redis redis-cli

How to proxy the incoming url request by pointing it to localhost indirectly:

Run this in the terminal and configure accrodingly: sudo vi /etc/hosts
