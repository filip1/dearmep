from argparse import ArgumentParser

from ..config import APP_NAME


def run():
    parser = ArgumentParser(
        prog=APP_NAME.lower(),
    )
    parser.parse_args()
