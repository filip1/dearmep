<!--
SPDX-FileCopyrightText: © 2023 iameru

SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Scheduler

The scheduler handles background tasks of the application. It is logically
seperated by "modules" with each module holding tasks.

## Module

Currently implemented `modules` are:

* `calls`

## Task Arguments

Example:
```yml
interval: 20.2 # in seconds, Optional as Tasks have their own default values
wait_first: false # true(default) or false, Optional
```

### interval

Time in seconds after which the task is executed again.

### wait_first

Optional. Defaults to `false`. If set to `true` the task's first execution is
after `seconds`, not immediately after startup.

## Calls Module

The `calls` module allows for scheduled, call relevant functions to be executed
regularly.

Currently supports the tasks:

* `build_queue`
* `handle_queue`

### build_queue

This task builds a queue of Users who have given the information that they
wanted to be called at the current time.

### handle_queue

This task checks the queue created by `build_queue` and makes a single phone
call to the first user in the queue.
