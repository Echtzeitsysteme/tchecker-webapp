FROM python:3.12 AS thecker_builder

WORKDIR /tchecker

# Install system dependencies and cmake/make to build tchecker
# Install tchecker dependencies bison, boost, flex, doxygen, catch2
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    cmake \
    bison \
    libboost-all-dev \
    flex \
    && rm -rf /var/lib/apt/lists/*


# Copy tchecker source code
COPY tchecker/ /tchecker/tchecker-source

RUN cd /tchecker && \
    mkdir build && \
    mkdir install

WORKDIR /tchecker/build

RUN cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/tchecker/install -DLIBTCHECKER_ENABLE_SHARED=ON /tchecker/tchecker-source && \
    make -j$(nproc) && \
    make install
    
FROM python:3.12



ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*


# Install pip dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY . .

# Copy tchecker from the builder stage
COPY --from=thecker_builder /tchecker/install/lib/libtchecker.so ./libtchecker.so

# Expose the FastAPI default port
EXPOSE 8000

# Run FastAPI using the CLI
CMD ["fastapi", "run", "main.py"]