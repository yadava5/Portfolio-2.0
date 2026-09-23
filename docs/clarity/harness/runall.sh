#!/bin/bash
# runall.sh <runname> <url> <spec>...   spec = "label w h mobile"
H=$(cd "$(dirname "$0")" && pwd); R=$1; U=$2; shift 2
O=$H/$R; /bin/mkdir -p $O; : > $O/sweep.log
for spec in "$@"; do set -- $spec; OUT=$O URL=$U node $H/sweep.mjs $1 $2 $3 $4 >> $O/sweep.log 2>&1 & done; wait
L=$(/usr/bin/grep -o 'DONE w[0-9]*' $O/sweep.log | /usr/bin/awk '{print $2}' | /usr/bin/paste -sd, -)
OUT=$O LABELS=$L node $H/analyse.mjs >/dev/null && OUT=$O LABELS=$L node $H/metrics.mjs >/dev/null
echo "$R: $L"; /usr/bin/grep FAIL $O/sweep.log
