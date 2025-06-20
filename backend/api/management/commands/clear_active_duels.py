from django.core.management.base import BaseCommand
from api.models import Duel

class Command(BaseCommand):
    help = "Set all active duels to 'abandoned' (or delete them) so developers can quickly reset the matchmaking state without wiping the whole DB."

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete', action='store_true', help='DELETE the active duel rows instead of just marking them abandoned.')

    def handle(self, *args, **options):
        qs = Duel.objects.filter(status='active')
        count = qs.count()
        if options['delete']:
            qs.delete()
            self.stdout.write(self.style.WARNING(f"Deleted {count} active duels."))
        else:
            updated = qs.update(status='abandoned')
            self.stdout.write(self.style.SUCCESS(f"Marked {updated} active duels as abandoned."))

        # Note: MATCHMAKING_QUEUE lives only in memory inside api.views; it will
        # always be empty after a server restart. During a live session you can
        # simply run `python manage.py shell -c 'from api.views import MATCHMAKING_QUEUE; MATCHMAKING_QUEUE.clear()'`
        # if needed. 