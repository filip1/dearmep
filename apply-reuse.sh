#!/bin/sh

# SPDX-FileCopyrightText: © 2024 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

set -e

default_year="$(date +%Y)"
license='AGPL-3.0-or-later'
format='spdx-symbol'


annotate() {
	path="$1"; shift
	git log --follow --no-rename-empty --diff-filter=r --date=format:%Y --format='format:%ad %aN' -- "$path" | sort -n -k 1 | sort -s -k 2 | uniq -c -f 1 | sort -snr -k 1,1 | while read -r count year author; do
		printf 'reuse annotate --fallback-dot-license --license %s --copyright-prefix %s %s --year %s --copyright "%s"\n' "$license" "$format" "$path" "$year" "$author"
	done
}


reuse lint --lines | cut -d : -f 1 | sort -u | while read -r path; do
	annotate "$path"
done
