#!/bin/sh
set -e

default_year="$(date +%Y)"
license='AGPL-3.0-or-later'
format='spdx-symbol'


annotate() {
	path="$1"; shift
	git log --follow --no-rename-empty --diff-filter=r --date=format:%Y --format='format:%ad %aN' -- "$path" | sort | uniq -c | sort -nr -k 1,1 | sort -ns -k 2,2 | uniq -f 2 | while read -r count year author; do
		printf 'reuse annotate --fallback-dot-license --license %s --copyright-prefix %s %s --year %s --copyright "%s"\n' "$license" "$format" "$path" "$year" "$author"
	done
}


reuse lint --lines | cut -d : -f 1 | sort -u | while read -r path; do
	annotate "$path"
done
