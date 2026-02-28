from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

logger = logging.Logger(__name__)

class TestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")

        if not user or not user.is_authenticated:
            await self.close()
            return

        await self.accept()

    async def receive(self, text_data):
        user = self.scope["user"]
        data = json.loads(text_data)

        await self.send(text_data=json.dumps({
            "message": f"{user.email}: {data.get('message')}"
        }))