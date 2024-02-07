#!/bin/sh

poetry run sh -c 'mypy && mypy tests && pytest && dearmep check translations'
