from fastapi_utils.tasks import repeat_every


@repeat_every(seconds=6.1, wait_first=True)
def build_queue():
    pass


@repeat_every(seconds=7.11, wait_first=False)
def work_queue():
    pass
