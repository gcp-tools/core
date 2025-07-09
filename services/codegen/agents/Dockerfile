FROM python:3.10-slim

WORKDIR /app

ENV PYTHONPATH=/app/src

# Install git for pip install from git+ URLs
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY .env .env
COPY src/ ./src/

EXPOSE 8080

CMD ["python", "src/server.py"]
