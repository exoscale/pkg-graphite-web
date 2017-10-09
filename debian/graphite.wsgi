import os, sys
import django
os.environ['DJANGO_SETTINGS_MODULE'] = 'graphite.settings'
if django.get_version() >= "1.7":
	django.setup()

import django.core.handlers.wsgi

application = django.core.handlers.wsgi.WSGIHandler()

# READ THIS
# Initializing the search index can be very expensive, please include
# the WSGIScriptImport directive pointing to this script in your vhost
# config to ensure the index is preloaded before any requests are handed
# to the process.
from graphite.logger import log
log.info("graphite.wsgi - pid %d - reloading search index" % os.getpid())
import graphite.metrics.search
