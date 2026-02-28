import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from urllib.parse import parse_qs


User = get_user_model()


@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None


class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        headers = dict(scope["headers"])

        if b"cookie" in headers:
            cookies = headers[b"cookie"].decode()
            cookies = dict(
                item.strip().split("=")
                for item in cookies.split(";")
                if "=" in item
            )

            token = cookies.get("access_token")

            if token:
                try:
                    # Validate token
                    UntypedToken(token)

                    decoded = jwt.decode(
                        token,
                        settings.SECRET_KEY,
                        algorithms=["HS256"],
                    )

                    user = await get_user(decoded["user_id"])
                    scope["user"] = user
                except (InvalidToken, TokenError, jwt.ExpiredSignatureError):
                    scope["user"] = None
            else:
                scope["user"] = None
        else:
            scope["user"] = None

        return await self.inner(scope, receive, send)