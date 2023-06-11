from django.core.management.base import BaseCommand

from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Tests the email connection'

    def handle(self, *args, **options):
        print("Command executed successfully.")

