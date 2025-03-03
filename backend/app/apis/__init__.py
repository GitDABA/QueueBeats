# Import all API modules to ensure they're properly registered

# Authentication & User Management
from . import spotify_auth
from . import spotify_search

# Queue and Song Management
from . import songs

# Configuration
from . import supabase
from . import supabase_config
from . import supabase_shared

# Utilities
from . import debug
from . import setup
from . import utils
from . import api_utils