
{ pkgs, ... }: {
  channel = "stable-23.11";
  packages = [
    (pkgs.python311.withPackages (ps: with ps; [
      flask
      flask-sqlalchemy
      flask-migrate
      flask-bcrypt
      flask-cors
      flask-session
      gunicorn
      psycopg2
      pg8000
      python-dotenv
      sqlalchemy
      stripe
      werkzeug
      greenlet
      itsdangerous
      jinja2
      markupsafe
      blinker
      click
      safety
    ]))
    pkgs.google-cloud-sdk
  ];
  idx.extensions = [
    "ms-python.python"
  ];
}
