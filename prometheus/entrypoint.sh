#!/bin/sh
set -ex

# Generate config.
/bin/confd -onetime -backend env

# Run Prometheus.
/bin/prometheus --config.file=/etc/prometheus/confd-prometheus.yml \
--storage.tsdb.path=/prometheus \
--web.console.libraries=/usr/share/prometheus/console_libraries \
--web.console.templates=/usr/share/prometheus/consoles \
--web.enable-lifecycle