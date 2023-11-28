from typing import Callable, List, Tuple

from fastapi_utils.tasks import repeat_every

from .calls import build_queue, handle_queue
from ..config import Config, SchedulerTaskConfig

SchedulerTask = Callable[[], None]


def get_background_tasks(config: Config):
    """
    Returns a list of configured background tasks to be run at startup.
    """
    tasks: List[Tuple[SchedulerTaskConfig, SchedulerTask]] = []

    if not config.scheduler:
        return []

    if config.scheduler.calls:
        # We add our tasks to the list of tasks to be run at startup if we find
        # their config.
        if (build_queue_cfg := config.scheduler.calls.build_queue):
            tasks.append((build_queue_cfg, build_queue))

        if (handle_queue_cfg := config.scheduler.calls.handle_queue):
            tasks.append((handle_queue_cfg, handle_queue))

    return [
        repeat_every(
            seconds=cfg.interval,
            wait_first=cfg.wait_first,
        )(func) for cfg, func in tasks]


__all__ = [
    "get_background_tasks",
]
