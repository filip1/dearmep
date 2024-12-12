# SPDX-FileCopyrightText: © 2023 iameru
# SPDX-FileCopyrightText: © 2024 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from logging import getLogger
from typing import Callable

from fastapi_restful.tasks import repeat_every
from prometheus_client import Counter

from ..config import Config, SchedulerTaskConfig
from .calls import build_queue, handle_queue


SchedulerTask = Callable[[], None]

_logger = getLogger(__name__)
scheduler_exceptions_total = Counter(
    name="scheduler_exceptions_total",
    documentation="Number of exceptions in scheduler tasks",
    labelnames=("task_name",),
)


def task_wrapper(func: SchedulerTask) -> SchedulerTask:
    """
    Wraps a background task to handle any exceptions in case they appear. We
    inform via logger and prometheus. We stop the background task in such a
    case by raising the exception.
    """

    def wrapped() -> None:
        try:
            func()
        except Exception:
            scheduler_exceptions_total.labels(func.__name__).inc()
            _logger.critical(
                f"Error in scheduled task {func.__name__}",
                exc_info=True,
            )
            raise

    return wrapped


def get_background_tasks(config: Config) -> list:
    """
    Returns a list of configured background tasks to be run at startup.
    """
    tasks: list[tuple[SchedulerTaskConfig, SchedulerTask]] = []

    if not config.scheduler:
        return []

    if config.scheduler.calls:
        # We add our tasks to the list of tasks to be run at startup if we find
        # their config.
        if build_queue_cfg := config.scheduler.calls.build_queue:
            tasks.append((build_queue_cfg, task_wrapper(build_queue)))

        if handle_queue_cfg := config.scheduler.calls.handle_queue:
            tasks.append((handle_queue_cfg, task_wrapper(handle_queue)))

    return [
        repeat_every(
            seconds=cfg.interval,
            wait_first=cfg.wait_first,
            raise_exceptions=True,
        )(func)
        for cfg, func in tasks
    ]


__all__ = [
    "get_background_tasks",
]
