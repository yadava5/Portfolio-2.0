#!/bin/bash
# runall.sh <runname> <url> <spec>...   spec = "label w h mobile"
H=$(cd "$(dirname "$0")" && pwd); R=$1; U=$2; shift 2
O=$H/$R; /bin/mkdir -p $O; : > $O/sweep.log
for spec in "$@"; do set -- $spec; OUT=$O URL=$U node $H/sweep.mjs $1 $2 $3 $4 >> $O/sweep.log 2>&1 & done; wait
L=$(/usr/bin/grep -o 'DONE w[0-9]*' $O/sweep.log | /usr/bin/awk '{print $2}' | /usr/bin/paste -sd, -)
OUT=$O LABELS=$L node $H/analyse.mjs >/dev/null || exit 1
OUT=$O LABELS=$L node $H/metrics.mjs >/dev/null || exit 1
echo "$R: $L"

# `grep FAIL` used to be the last command in this file, which made the SCRIPT'S
# EXIT CODE THE GREP'S — 1 when the sweep was clean and 0 when a viewport died.
# Nothing read it until gate H put this script in a workflow, where an inverted
# exit code is the difference between a green run and a real one. Decide it here
# instead, out loud. (See ~/.claude memory: pipefail-makes-a-clean-grep-fail.)
if /usr/bin/grep -q FAIL "$O/sweep.log"; then
  /usr/bin/grep FAIL "$O/sweep.log"
  exit 1
fi
# A sweep that produced no labels produced no data, and every downstream
# reader would then compare an empty object against the baseline and pass.
if [ -z "$L" ]; then echo "runall: no viewport finished — nothing was swept"; exit 1; fi
exit 0
