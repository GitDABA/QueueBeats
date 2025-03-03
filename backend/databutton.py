"""
Mock databutton module to replace the actual Databutton dependency
"""

class StorageClient:
    """Mock storage client that does nothing"""
    def __init__(self, *args, **kwargs):
        pass
        
    def create(self, *args, **kwargs):
        return self
        
    def read(self, *args, **kwargs):
        return None
        
    def write(self, *args, **kwargs):
        pass
        
    def delete(self, *args, **kwargs):
        pass
        
    def list(self, *args, **kwargs):
        return []

class Config:
    """Mock config class that stores values in memory"""
    def __init__(self):
        self._values = {}
        
    def get(self, key, default=None):
        return self._values.get(key, default)
        
    def set(self, key, value):
        self._values[key] = value
        
    def delete(self, key):
        if key in self._values:
            del self._values[key]

# Create mock instances
storage = StorageClient()
config = Config()

# Helper function to get the current environment
def get_environment():
    return "development"
