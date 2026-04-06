import redis
from django.conf import settings

redis_client = redis.Redis.from_url(settings.REDIS_URL)

def set_user_online(user_id):
    redis_client.sadd("online_users", user_id)

def set_user_offline(user_id):
    redis_client.srem("online_users", user_id)

def get_online_users():
    return redis_client.smembers("online_users")