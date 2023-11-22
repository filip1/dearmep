from . import calls

# List of tasks to be initiated on app startup via scheduler.
tasks = [
    calls.build_queue,
    calls.work_queue,
]

__all__ = [
    "tasks",
]
