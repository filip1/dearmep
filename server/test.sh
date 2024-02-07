#!/bin/sh

poetry run sh -c 'ruff check; mypy && mypy tests && pytest && dearmep check translations'
