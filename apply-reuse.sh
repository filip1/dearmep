#!/bin/sh
set -e

default_year="$(date +%Y)"
license='AGPL-3.0-or-later'
format='spdx-symbol'


annotate() {
	year="$1"; shift
	path="$1"; shift
	printf 'reuse annotate --fallback-dot-license --license %s --copyright-prefix %s --year %s' "$license" "$format" "$year"
	git log --follow --no-rename-empty --diff-filter=r --format=format:%aN -- "$path" | sort | uniq -c | sort -bnr -k 1,1 | while read -r count author; do
		printf " --copyright '%s'" "$author"
	done
	printf ' %s\n' "$path"
}


reuse lint --lines | cut -d : -f 1 | sort -u | while read -r path; do
	created="$(git log --follow --format=%ad --date format:%Y "$path" | tail -n 1)"
	if [ -z "$created" ]; then
		created="$default_year"
	fi
	annotate "$created" "$path"
done
