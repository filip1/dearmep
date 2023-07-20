#!/bin/sh

poetry run sh -c 'flake8 && mypy && mypy tests && pytest && dearmep check translations'
