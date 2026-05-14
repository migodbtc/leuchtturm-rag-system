import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field
from sqlalchemy.engine import URL

"""
PYDANTIC SETTINGS: a class inherited from base settings, containing 
Dynamic database URL using sqlalchemy's URL object
as well as a Config class to detect the virtual environment
"""
class Settings(BaseSettings):

    """
    AUTHENTICATION SECURITY: for auth.py encryption and decryption to protect
    passwords and such.
    """
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-for-mvp-only")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    """
    MYSQL CONSTANTS: needed in order to properly concatenate the dynamic URL 
    database string. MYSQL_PASSWORD needs to be either a real PW value or 
    '' for empty passwords. 
    """
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""  
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_DB: str = "yellowpad_db"


    """
    DATABASE_URL HELPER FUNCTION: a helper function dedicated in dynamically
    constructing the database URL depending on the valid MYSQL constants using
    sqlalchemy's URL object for character handling. 
    - Passes None if MYSQL_PASSWORD is empty
    - Uses MySQL + Asynchronous IO SQL in the driver
    """
    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        url = URL.create(
            drivername="mysql+aiomysql",
            username=self.MYSQL_USER,
            password=self.MYSQL_PASSWORD or None, 
            host=self.MYSQL_HOST,
            port=self.MYSQL_PORT,
            database=self.MYSQL_DB
        )
        return url.render_as_string(hide_password=False)


    """
    MODEL_CONFIG: A configuration dictionary for settings specifically used for the
    encoding of the env_file as well as the .env file itself
    """
    model_config = SettingsConfigDict(env_file=".venv", env_file_encoding="utf-8")

"""
SETTINGS INSTANCE: an instance of the Settings class declared above. Used in order
to simply call the instance to other modules.
"""
settings = Settings()