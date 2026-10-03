# ========================================================
# MediTwin-AI Backend Dockerfile (FastAPI + ML Engine)
# ========================================================
FROM python:3.11-slim

WORKDIR /app
ENV PYTHONPATH=/app

# Install system dependencies for PyPDF, compilation, and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code and ML models
COPY . .

# Expose port
EXPOSE 8000

# Run FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
