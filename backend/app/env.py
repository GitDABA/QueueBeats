"""Usage:

from app.env import Mode, mode, is_dev_mode, is_prod_mode, is_test_mode

if mode == Mode.PROD:
    print("Running in deployed service")
else:
    print("Running in development workspace")

if is_dev_mode():
    print("Running in development mode")
elif is_prod_mode():
    print("Running in production mode")
elif is_test_mode():
    print("Running in test mode")
"""

import os
from enum import Enum, auto


class Mode(Enum):
    """
    Enum to represent the different modes that the app can run in.
    """
    DEV = auto()
    PROD = auto()
    TEST = auto()


def get_mode() -> Mode:
    """
    Get the mode that the app is running in.
    """
    # Check environment variable first
    env = os.environ.get("APP_ENV", "development").lower()
    
    if env == "production":
        return Mode.PROD
    elif env == "test":
        return Mode.TEST
    else:
        return Mode.DEV


mode = get_mode()


def is_dev_mode() -> bool:
    """
    Check if the app is running in development mode.
    """
    return mode == Mode.DEV


def is_prod_mode() -> bool:
    """
    Check if the app is running in production mode.
    """
    return mode == Mode.PROD


def is_test_mode() -> bool:
    """
    Check if the app is running in test mode.
    """
    return mode == Mode.TEST


__all__ = [
    "Mode",
    "mode",
    "is_dev_mode",
    "is_prod_mode",
    "is_test_mode",
]
